declare module 'sql.js' {
    export interface SqlJsConfig {
        locateFile?: (file: string) => string;
        wasmBinary?: Uint8Array;
    }

    export interface SqlJsStatic {
        Database: typeof Database;
    }

    export class Database {
        constructor(data?: Buffer | Uint8Array);
        run(sql: string, params?: any[]): void;
        exec(sql: string, params?: any[]): Array<{columns: string[], values: any[][]}>;
        close(): void;
    }

    export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}