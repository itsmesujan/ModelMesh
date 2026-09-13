import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

export class GatewayDatabase {
  private db: DatabaseSync;

  constructor(customPath?: string) {
    if (customPath === ':memory:') {
      this.db = new DatabaseSync(':memory:');
      this.initSchema();
      return;
    }
    const dbDir = customPath ? path.dirname(customPath) : path.join(process.cwd(), '.modelmesh_data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = customPath || path.join(dbDir, 'modelmesh.db');
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  private initSchema(): void {
    // Enable WAL mode for high concurrency
    this.db.exec('PRAGMA journal_mode = WAL;');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        auth_type TEXT NOT NULL,
        endpoint TEXT,
        credential_ref TEXT,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_validated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS vault_records (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        ciphertext TEXT NOT NULL,
        iv TEXT NOT NULL,
        tag TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS active_policy (
        id TEXT PRIMARY KEY,
        mode TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS telemetry (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        canonical_model TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        provider_model_id TEXT NOT NULL,
        status_code INTEGER NOT NULL,
        latency_ms INTEGER NOT NULL,
        total_tokens INTEGER NOT NULL,
        cost_estimate REAL NOT NULL,
        trace_json TEXT,
        created_at INTEGER NOT NULL
      );
    `);
  }

  public saveVaultRecord(record: {
    id: string;
    providerId: string;
    ciphertext: string;
    iv: string;
    tag: string;
    salt: string;
    createdAt: number;
  }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO vault_records (id, provider_id, ciphertext, iv, tag, salt, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(record.id, record.providerId, record.ciphertext, record.iv, record.tag, record.salt, record.createdAt);
  }

  public getVaultRecord(providerId: string): any {
    const stmt = this.db.prepare(`
      SELECT * FROM vault_records WHERE provider_id = ? ORDER BY created_at DESC LIMIT 1
    `);
    return stmt.get(providerId);
  }

  public getAllVaultRecords(): any[] {
    const stmt = this.db.prepare(`SELECT * FROM vault_records`);
    return stmt.all();
  }

  public saveConnection(conn: {
    id: string;
    providerId: string;
    authType: string;
    endpoint?: string;
    credentialRef?: string;
    status: string;
    createdAt: number;
    lastValidatedAt?: number;
  }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO connections (id, provider_id, auth_type, endpoint, credential_ref, status, created_at, last_validated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      conn.id,
      conn.providerId,
      conn.authType,
      conn.endpoint || null,
      conn.credentialRef || null,
      conn.status,
      conn.createdAt,
      conn.lastValidatedAt || null
    );
  }

  public getAllConnections(): any[] {
    const stmt = this.db.prepare(`SELECT * FROM connections`);
    return stmt.all();
  }

  public saveActivePolicyMode(mode: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO active_policy (id, mode, updated_at)
      VALUES ('active', ?, ?)
    `);
    stmt.run(mode, Date.now());
  }

  public getActivePolicyMode(): string | null {
    const stmt = this.db.prepare(`SELECT mode FROM active_policy WHERE id = 'active'`);
    const row = stmt.get() as any;
    return row ? row.mode : null;
  }

  public close(): void {
    this.db.close();
  }
}
