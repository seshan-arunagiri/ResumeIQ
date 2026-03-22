import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "resumeiq.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS companies (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            name            TEXT    NOT NULL,
            min_cgpa        REAL    DEFAULT 0,
            required_skills TEXT    DEFAULT '',
            weight_cgpa     INTEGER DEFAULT 20,
            weight_leetcode INTEGER DEFAULT 30,
            weight_github   INTEGER DEFAULT 20,
            weight_skills   INTEGER DEFAULT 30,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS students (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id        INTEGER,
            filename          TEXT    NOT NULL,
            file_hash         TEXT    NOT NULL,
            name              TEXT,
            email             TEXT,
            cgpa              REAL,
            skills            TEXT    DEFAULT '[]',
            leetcode_username TEXT,
            github_username   TEXT,
            lc_easy           INTEGER DEFAULT 0,
            lc_medium         INTEGER DEFAULT 0,
            lc_hard           INTEGER DEFAULT 0,
            lc_total          INTEGER DEFAULT 0,
            lc_ranking        INTEGER DEFAULT 0,
            gh_repos          INTEGER DEFAULT 0,
            gh_top_lang       TEXT,
            gh_stars          INTEGER DEFAULT 0,
            gh_commits        INTEGER DEFAULT 0,
            score             REAL    DEFAULT 0,
            recommendation    TEXT,
            status            TEXT    DEFAULT 'pending',
            created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (company_id, file_hash)
        );
    """)
    conn.commit()
    conn.close()
    print("[DB] Tables ready →", DB_PATH)
