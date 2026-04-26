import { Client } from 'pg'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is required.')
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  try {
    await client.connect()

    console.log('\nConnected to database. Fetching table list...\n')

    const tablesRes = await client.query(
      `SELECT table_schema, table_name
       FROM information_schema.tables
       WHERE table_type = 'BASE TABLE'
         AND table_schema NOT IN ('pg_catalog', 'information_schema')
       ORDER BY table_schema, table_name;`
    )

    const tables = tablesRes.rows
    if (tables.length === 0) {
      console.log('No tables found.')
      return
    }

    for (const t of tables) {
      const { table_schema, table_name } = t
      console.log('------------------------------------------------------------')
      console.log(`Table: ${table_schema}.${table_name}`)

      // Columns
      const colsRes = await client.query(
        `SELECT column_name, data_type, is_nullable, column_default, ordinal_position, character_maximum_length
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position;`,
        [table_schema, table_name]
      )

      const cols = colsRes.rows
      console.log('Columns:')
      for (const c of cols) {
        const len = c.character_maximum_length ? `(${c.character_maximum_length})` : ''
        console.log(`  - ${c.column_name} : ${c.data_type}${len} | nullable=${c.is_nullable} | default=${c.column_default}`)
      }

      // Primary keys
      const pkRes = await client.query(
        `SELECT kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
           AND tc.table_schema = kcu.table_schema
         WHERE tc.constraint_type = 'PRIMARY KEY'
           AND tc.table_schema = $1
           AND tc.table_name = $2
         ORDER BY kcu.ordinal_position;`,
        [table_schema, table_name]
      )
      const pkCols = pkRes.rows.map(r => r.column_name)
      console.log('Primary key:', pkCols.length ? pkCols.join(', ') : '[none]')

      // Foreign keys
      const fkRes = await client.query(
        `SELECT kcu.column_name AS column_name,
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
         FROM information_schema.table_constraints AS tc
         JOIN information_schema.key_column_usage AS kcu
           ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
         JOIN information_schema.constraint_column_usage AS ccu
           ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
         WHERE tc.constraint_type = 'FOREIGN KEY'
           AND tc.table_schema = $1
           AND tc.table_name = $2;`,
        [table_schema, table_name]
      )
      if (fkRes.rows.length === 0) {
        console.log('Foreign keys: [none]')
      } else {
        console.log('Foreign keys:')
        for (const f of fkRes.rows) {
          console.log(`  - ${f.column_name} -> ${f.foreign_table_schema}.${f.foreign_table_name}(${f.foreign_column_name})`)
        }
      }

      console.log('')
    }

    console.log('Done.')
  } catch (err) {
    console.error('Error querying database:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()
