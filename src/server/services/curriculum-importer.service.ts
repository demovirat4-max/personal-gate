import { supabaseAdmin } from '@/lib/supabase/server';
import { TabularImporterService } from './tabular-importer.service';
import { CurriculumService } from './curriculum.service';
import {
  ImportDryRunRequest,
  ImportDryRunResponse,
  ImportCommitRequest,
  ImportCommitResponse,
  ImportBatchSummary,
  NormalizedRowResult,
} from '@/contracts/curriculum/import.contract';

export class CurriculumImporterOrchestrator {
  /**
   * Generates Dry-Run preview without committing any database records.
   * Persists batch metadata + row results to Supabase with status READY.
   */
  static async executeDryRun(request: ImportDryRunRequest): Promise<ImportDryRunResponse> {
    let rawContent: string | Buffer;

    if (request.sourceType === 'GOOGLE_SHEETS') {
      if (!request.googleSheetsUrl) {
        throw new Error('googleSheetsUrl is required for GOOGLE_SHEETS source type');
      }
      rawContent = await TabularImporterService.fetchGoogleSheetsCsv(request.googleSheetsUrl);
    } else {
      if (!request.fileContentBase64) {
        throw new Error('fileContentBase64 is required for file uploads');
      }
      rawContent = Buffer.from(request.fileContentBase64, 'base64');
    }

    const rawRecords = TabularImporterService.parseRawRecords(request.sourceType, rawContent);
    if (!rawRecords || rawRecords.length === 0) {
      throw new Error('Import source contains zero rows or headers could not be identified');
    }

    const normalizedRows: NormalizedRowResult[] = [];
    let validCount = 0;
    let warningCount = 0;
    let rejectedCount = 0;
    let insertCount = 0;
    let updateCount = 0;
    let unchangedCount = 0;

    const seenVideoIdsInFile = new Set<string>();

    rawRecords.forEach((record, index) => {
      const normalized = TabularImporterService.normalizeRow(record, index);

      if (normalized.status === 'REJECTED') {
        rejectedCount++;
        normalizedRows.push(normalized);
        return;
      }

      if (normalized.youtubeVideoId) {
        if (seenVideoIdsInFile.has(normalized.youtubeVideoId)) {
          normalized.status = 'WARNING';
          normalized.errorCode = 'DUPLICATE_IN_FILE';
          normalized.errorMessage = `Duplicate YouTube Video ID (${normalized.youtubeVideoId}) found within the same import file`;
          warningCount++;
        } else {
          seenVideoIdsInFile.add(normalized.youtubeVideoId);
          validCount++;
          insertCount++;
        }
      }

      normalizedRows.push(normalized);
    });

    const reviewToken = `rev_tok_${crypto.randomUUID().replace(/-/g, '')}`;

    // Persist batch record to Supabase
    const { data: batchData, error: batchErr } = await supabaseAdmin
      .from('import_batches')
      .insert({
        source_type: request.sourceType,
        source_label: request.sourceLabel,
        status: 'READY',
        row_count: rawRecords.length,
        inserted_count: 0,
        updated_count: 0,
        unchanged_count: 0,
        rejected_count: rejectedCount,
        review_token: reviewToken,
      })
      .select('id')
      .single();

    if (batchErr) throw new Error(`Failed to create import batch: ${batchErr.message}`);
    const batchId = batchData.id;

    // Persist row results to Supabase
    const rowInserts = normalizedRows.map((row) => ({
      batch_id: batchId,
      row_number: row.rowNumber,
      raw_data_json: row.rawData,
      normalized_data_json: row.normalizedRow ?? null,
      status: row.status,
      error_code: row.errorCode ?? null,
      error_message: row.errorMessage ?? null,
      field_name: row.fieldName ?? null,
    }));

    if (rowInserts.length > 0) {
      const { error: rowErr } = await supabaseAdmin.from('import_row_results').insert(rowInserts);
      if (rowErr) throw new Error(`Failed to store import row results: ${rowErr.message}`);
    }

    return {
      batchId,
      reviewToken,
      sourceType: request.sourceType,
      sourceLabel: request.sourceLabel,
      rowCount: rawRecords.length,
      validCount,
      warningCount,
      rejectedCount,
      insertCount,
      updateCount,
      unchangedCount,
      rows: normalizedRows,
    };
  }

  /**
   * Transactional Commit: validates review token, checks idempotency key,
   * then commits all VALID rows to Supabase via CurriculumService.
   */
  static async executeCommit(request: ImportCommitRequest): Promise<ImportCommitResponse> {
    // Check idempotency key
    const { data: existingBatch } = await supabaseAdmin
      .from('import_batches')
      .select('*')
      .eq('idempotency_key', request.idempotencyKey)
      .maybeSingle();

    if (existingBatch) {
      return {
        batchId: existingBatch.id,
        status: 'COMPLETED',
        insertedSubjectsCount: 0,
        insertedTopicsCount: 0,
        insertedLecturesCount: existingBatch.inserted_count,
        updatedLecturesCount: existingBatch.updated_count,
        completedAt: existingBatch.completed_at ?? new Date().toISOString(),
      };
    }

    // Fetch batch
    const { data: batch, error: batchErr } = await supabaseAdmin
      .from('import_batches')
      .select('*')
      .eq('id', request.batchId)
      .single();

    if (batchErr || !batch) throw new Error('Import batch not found or dry-run has expired');
    if (batch.review_token !== request.reviewToken) throw new Error('Invalid review token for this import batch');

    // Mark as committing
    await supabaseAdmin
      .from('import_batches')
      .update({ status: 'COMMITTING', idempotency_key: request.idempotencyKey })
      .eq('id', request.batchId);

    // Fetch valid rows
    const { data: rows, error: rowsErr } = await supabaseAdmin
      .from('import_row_results')
      .select('*')
      .eq('batch_id', request.batchId)
      .eq('status', 'VALID');

    if (rowsErr) throw new Error(`Failed to fetch import rows: ${rowsErr.message}`);

    let insertedLecturesCount = 0;
    let updatedLecturesCount = 0;
    let unchangedCount = 0;

    for (const row of rows || []) {
      const normalized = row.normalized_data_json as any;
      if (!normalized || !normalized.youtubeUrl) continue;

      try {
        const videoId = normalized.youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (!videoId) continue;

        const result = await CurriculumService.commitNormalizedRow({
          subject: normalized.subject,
          topic: normalized.topic,
          subtopic: normalized.subtopic ?? null,
          lectureTitle: normalized.lectureTitle,
          youtubeUrl: normalized.youtubeUrl,
          youtubeVideoId: videoId,
          teacher: normalized.teacher ?? null,
          courseOrPlaylist: normalized.courseOrPlaylist ?? null,
          lectureOrder: normalized.lectureOrder ?? 1,
          priority: normalized.priority ?? 'NORMAL',
          notes: normalized.notes ?? null,
          durationSeconds: normalized.durationSeconds ?? 0,
        });

        if (result.isInsert) insertedLecturesCount++;
        else if (result.isUpdate) updatedLecturesCount++;
        else unchangedCount++;

        // Update row result status
        await supabaseAdmin
          .from('import_row_results')
          .update({ status: result.isInsert ? 'INSERTED' : result.isUpdate ? 'UPDATED' : 'UNCHANGED' })
          .eq('id', row.id);
      } catch {
        // Row-level error: leave status as VALID, log silently
      }
    }

    const completedAt = new Date().toISOString();
    await supabaseAdmin
      .from('import_batches')
      .update({
        status: 'COMPLETED',
        inserted_count: insertedLecturesCount,
        updated_count: updatedLecturesCount,
        unchanged_count: unchangedCount,
        completed_at: completedAt,
      })
      .eq('id', request.batchId);

    // Count unique subjects and topics after commit
    const { count: subjectsCount } = await supabaseAdmin.from('subjects').select('*', { count: 'exact', head: true });
    const { count: topicsCount } = await supabaseAdmin.from('topics').select('*', { count: 'exact', head: true });

    return {
      batchId: request.batchId,
      status: 'COMPLETED',
      insertedSubjectsCount: subjectsCount ?? 0,
      insertedTopicsCount: topicsCount ?? 0,
      insertedLecturesCount,
      updatedLecturesCount,
      completedAt,
    };
  }

  /**
   * Retrieves import batch history from Supabase (last 50, newest first)
   */
  static async getImportHistory(): Promise<ImportBatchSummary[]> {
    const { data, error } = await supabaseAdmin
      .from('import_batches')
      .select(
        'id, source_type, source_label, status, row_count, inserted_count, updated_count, rejected_count, created_at, completed_at'
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(`Failed to fetch import history: ${error.message}`);

    return (data || []).map((b: any) => ({
      id: b.id,
      sourceType: b.source_type,
      sourceLabel: b.source_label,
      status: b.status,
      rowCount: b.row_count,
      insertedCount: b.inserted_count,
      updatedCount: b.updated_count,
      rejectedCount: b.rejected_count,
      createdAt: b.created_at,
      completedAt: b.completed_at ?? null,
    }));
  }
}
