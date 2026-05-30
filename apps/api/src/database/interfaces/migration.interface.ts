export interface MigrationBuilder {
  sql(sql: string): void;
  createTable(tableName: string, columns: Record<string, unknown>): void;
  dropTable(tableName: string): void;
  addColumn(tableName: string, columnName: string, columnOptions: unknown): void;
  dropColumn(tableName: string, columnName: string): void;
  createIndex(tableName: string, columns: string | string[], options?: unknown): void;
  dropIndex(tableName: string, columns: string | string[], options?: unknown): void;
}

export interface Migration {
  shorthands?: Record<string, unknown>;
  up: (pgm: MigrationBuilder) => void | Promise<void>;
  down: (pgm: MigrationBuilder) => void | Promise<void>;
}
