import { Mission } from "@/app/lib/game-types";

export const MISSIONS: Mission[] = [
  {
    id: 1,
    level: 1,
    academy: "Foundations",
    title: "Customer Filter Bootcamp",
    difficulty: "Rookie",
    dialect: "ANSI SQL",
    story:
      "You just joined the data squad. Start by filtering only premium customers in Bucharest.",
    objective:
      "Return customer_id, customer_name, city for customers from Bucharest with status 'premium'.",
    starterQuery:
      "SELECT customer_id, customer_name, city\nFROM customers\nWHERE city = 'Bucharest'\n  AND status = 'premium';",
    solutionQuery:
      "SELECT customer_id, customer_name, city FROM customers WHERE city = 'Bucharest' AND status = 'premium';",
    hints: [
      "Use one FROM table: customers.",
      "Use WHERE for row filters.",
      "Combine both conditions with AND.",
    ],
    concepts: [
      "SELECT controls output columns only.",
      "WHERE filters rows before grouping.",
      "String literals are quoted with single quotes.",
    ],
    commonMistakes: [
      "Using HAVING instead of WHERE for non-aggregated filters.",
      "Forgetting quotes around text values.",
    ],
    rules: [
      {
        label: "Read customers",
        pattern: /from\s+customers\b/i,
        points: 20,
        tip: "Use customers as source table.",
      },
      {
        label: "Filter city",
        pattern: /city\s*=\s*'bucharest'/i,
        points: 25,
        tip: "Keep only Bucharest rows.",
      },
      {
        label: "Filter status",
        pattern: /status\s*=\s*'premium'/i,
        points: 25,
        tip: "Keep only premium customers.",
      },
      {
        label: "Use WHERE",
        pattern: /where\s+/i,
        points: 20,
        tip: "Filtering must happen in WHERE.",
      },
    ],
    bonusRules: [
      {
        label: "Explicit columns",
        pattern: /select\s+customer_id\s*,\s*customer_name\s*,\s*city/i,
        points: 10,
        tip: "Avoid SELECT * while learning.",
      },
    ],
    quiz: {
      question: "Which clause filters rows before grouping?",
      options: ["WHERE", "HAVING", "ORDER BY", "JOIN"],
      correctIndex: 0,
      explanation: "WHERE filters rows first. HAVING filters aggregated groups.",
    },
    datasetPreview: {
      columns: ["customer_id", "customer_name", "city", "status"],
      rows: [
        ["1", "Ana Pop", "Bucharest", "premium"],
        ["2", "Radu Ionescu", "Cluj", "standard"],
        ["3", "Elena Manea", "Bucharest", "premium"],
      ],
    },
    schema: {
      tables: [
        {
          id: "customers",
          name: "customers",
          columns: ["customer_id PK", "customer_name", "city", "status"],
          x: 50,
          y: 50,
        },
      ],
      links: [],
    },
  },
  {
    id: 2,
    level: 2,
    academy: "Foundations",
    title: "Top Revenue Snapshot",
    difficulty: "Rookie",
    dialect: "PostgreSQL",
    story:
      "The sales lead wants the latest top 5 invoices by total amount for a dashboard card.",
    objective:
      "Return invoice_id, issued_at, total sorted by total descending and limited to 5 rows.",
    starterQuery:
      "SELECT invoice_id, issued_at, total\nFROM invoices\nORDER BY total DESC\nLIMIT 5;",
    solutionQuery:
      "SELECT invoice_id, issued_at, total FROM invoices ORDER BY total DESC LIMIT 5;",
    hints: [
      "Use ORDER BY total DESC before limiting.",
      "In PostgreSQL, use LIMIT 5.",
    ],
    concepts: [
      "Sorting happens before limiting.",
      "LIMIT syntax differs by SGBD.",
    ],
    commonMistakes: [
      "Forgetting ORDER BY and getting random rows.",
      "Using TOP in PostgreSQL mode.",
    ],
    rules: [
      {
        label: "Read invoices",
        pattern: /from\s+invoices\b/i,
        points: 25,
        tip: "Source table is invoices.",
      },
      {
        label: "Sort by total desc",
        pattern: /order\s+by\s+total\s+desc/i,
        points: 35,
        tip: "Sort highest totals first.",
      },
      {
        label: "Limit 5",
        pattern: /limit\s+5\b/i,
        points: 30,
        tip: "Use LIMIT 5 in PostgreSQL.",
      },
    ],
    bonusRules: [
      {
        label: "No SELECT *",
        pattern: /select\s+(?!\*)/i,
        points: 10,
        tip: "Pick only needed columns.",
      },
    ],
    quiz: {
      question: "Which statement is true?",
      options: [
        "LIMIT is PostgreSQL/MySQL style row cap.",
        "LIMIT works only in SQL Server.",
        "ORDER BY runs after LIMIT in SQL.",
        "TOP is standard in every engine.",
      ],
      correctIndex: 0,
      explanation: "LIMIT is common in PostgreSQL/MySQL; SQL Server often uses TOP or OFFSET/FETCH.",
    },
    datasetPreview: {
      columns: ["invoice_id", "issued_at", "total"],
      rows: [
        ["A-101", "2026-05-20", "950"],
        ["A-102", "2026-05-21", "1210"],
        ["A-103", "2026-05-21", "720"],
      ],
    },
    schema: {
      tables: [
        {
          id: "invoices",
          name: "invoices",
          columns: ["invoice_id PK", "issued_at", "total", "customer_id FK"],
          x: 50,
          y: 50,
        },
      ],
      links: [],
    },
  },
  {
    id: 3,
    level: 3,
    academy: "Foundations",
    title: "Regional Sales Rollup",
    difficulty: "Rookie",
    dialect: "ANSI SQL",
    story:
      "Finance needs total sales by region, only for regions that sold more than 10,000.",
    objective:
      "Return region and total_sales using SUM, GROUP BY region, HAVING total > 10000.",
    starterQuery:
      "SELECT region, SUM(total_amount) AS total_sales\nFROM orders\nGROUP BY region\nHAVING SUM(total_amount) > 10000\nORDER BY total_sales DESC;",
    solutionQuery:
      "SELECT region, SUM(total_amount) AS total_sales FROM orders GROUP BY region HAVING SUM(total_amount) > 10000 ORDER BY total_sales DESC;",
    hints: [
      "Use SUM(total_amount).",
      "GROUP BY region is mandatory.",
      "Aggregate filters go in HAVING.",
    ],
    concepts: [
      "GROUP BY forms groups.",
      "HAVING filters groups after aggregation.",
    ],
    commonMistakes: [
      "Filtering aggregated totals in WHERE.",
      "Missing GROUP BY while selecting region.",
    ],
    rules: [
      { label: "Read orders", pattern: /from\s+orders\b/i, points: 15, tip: "Use orders table." },
      {
        label: "Aggregate sum",
        pattern: /sum\s*\(\s*total_amount\s*\)/i,
        points: 25,
        tip: "Compute total sales with SUM.",
      },
      {
        label: "Group by region",
        pattern: /group\s+by\s+region/i,
        points: 25,
        tip: "Group rows by region.",
      },
      {
        label: "Having threshold",
        pattern: /having\s+sum\s*\(\s*total_amount\s*\)\s*>\s*10000/i,
        points: 25,
        tip: "Keep only regions above 10000.",
      },
    ],
    bonusRules: [
      {
        label: "Sort by total desc",
        pattern: /order\s+by\s+(total_sales|sum\s*\(\s*total_amount\s*\))\s+desc/i,
        points: 10,
        tip: "Sort strongest regions first.",
      },
    ],
    quiz: {
      question: "Where do we filter aggregate values?",
      options: ["HAVING", "WHERE", "FROM", "ON"],
      correctIndex: 0,
      explanation: "HAVING filters grouped/aggregated results.",
    },
    datasetPreview: {
      columns: ["order_id", "region", "total_amount"],
      rows: [
        ["1001", "RO-EST", "4500"],
        ["1002", "RO-EST", "7600"],
        ["1003", "RO-VEST", "3900"],
      ],
    },
    schema: {
      tables: [
        {
          id: "orders",
          name: "orders",
          columns: ["order_id PK", "region", "total_amount", "customer_id FK"],
          x: 50,
          y: 50,
        },
      ],
      links: [],
    },
  },
  {
    id: 4,
    level: 4,
    academy: "Relational",
    title: "Customer + Order Bridge",
    difficulty: "Rookie",
    dialect: "ANSI SQL",
    story:
      "You need one table communication path: list customer names with each order total.",
    objective:
      "Return customer_name and total_amount by joining customers and orders on customer_id.",
    starterQuery:
      "SELECT c.customer_name, o.total_amount\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id;",
    solutionQuery:
      "SELECT c.customer_name, o.total_amount FROM customers c JOIN orders o ON c.customer_id = o.customer_id;",
    hints: [
      "Use INNER JOIN by default with JOIN.",
      "Always include ON condition with key match.",
    ],
    concepts: [
      "Joins define how rows communicate across tables.",
      "Primary key to foreign key links are standard join paths.",
    ],
    commonMistakes: [
      "Missing ON clause and producing cross join explosion.",
      "Joining wrong keys.",
    ],
    rules: [
      { label: "Customers table", pattern: /from\s+customers\b/i, points: 20, tip: "Start from customers." },
      { label: "Join orders", pattern: /join\s+orders\b/i, points: 20, tip: "Bring orders into query." },
      {
        label: "Join condition",
        pattern: /on\s+(c\.?customer_id|customers\.?customer_id)\s*=\s*(o\.?customer_id|orders\.?customer_id)/i,
        points: 40,
        tip: "Connect customer_id to customer_id.",
      },
    ],
    bonusRules: [
      {
        label: "Select both fields",
        pattern: /select\s+.*customer_name.*total_amount|select\s+.*total_amount.*customer_name/i,
        points: 10,
        tip: "Return both requested values.",
      },
    ],
    quiz: {
      question: "What happens if JOIN has no ON?",
      options: [
        "You may get a cross join with huge row count.",
        "It behaves like LEFT JOIN automatically.",
        "SQL fixes it using PK metadata.",
        "The query cannot parse in any engine.",
      ],
      correctIndex: 0,
      explanation: "Without ON, many engines produce a Cartesian product.",
    },
    datasetPreview: {
      columns: ["customer_name", "total_amount"],
      rows: [
        ["Ana Pop", "450"],
        ["Ana Pop", "220"],
        ["Radu Ionescu", "780"],
      ],
    },
    schema: {
      tables: [
        {
          id: "customers",
          name: "customers",
          columns: ["customer_id PK", "customer_name", "segment"],
          x: 24,
          y: 50,
        },
        {
          id: "orders",
          name: "orders",
          columns: ["order_id PK", "customer_id FK", "total_amount"],
          x: 74,
          y: 50,
        },
      ],
      links: [{ from: "customers", to: "orders", label: "1 -> N by customer_id" }],
    },
  },
  {
    id: 5,
    level: 5,
    academy: "Relational",
    title: "LEFT JOIN Missing Inventory",
    difficulty: "Advanced",
    dialect: "ANSI SQL",
    story:
      "Operations needs products that never received stock entries. Missing rows matter.",
    objective:
      "Return product_name for products without matching stock_movements rows.",
    starterQuery:
      "SELECT p.product_name\nFROM products p\nLEFT JOIN stock_movements s ON p.product_id = s.product_id\nWHERE s.product_id IS NULL;",
    solutionQuery:
      "SELECT p.product_name FROM products p LEFT JOIN stock_movements s ON p.product_id = s.product_id WHERE s.product_id IS NULL;",
    hints: [
      "Use LEFT JOIN from products to stock_movements.",
      "Detect missing right-side rows with IS NULL.",
    ],
    concepts: [
      "LEFT JOIN keeps all left table rows.",
      "NULL checks detect unmatched rows.",
    ],
    commonMistakes: [
      "Using INNER JOIN and losing unmatched products.",
      "Checking p.product_id IS NULL instead of right side.",
    ],
    rules: [
      { label: "Read products", pattern: /from\s+products\b/i, points: 18, tip: "Products should be left side." },
      { label: "Left join stock", pattern: /left\s+join\s+stock_movements\b/i, points: 30, tip: "Use LEFT JOIN." },
      {
        label: "Join key",
        pattern: /on\s+p\.?product_id\s*=\s*s\.?product_id|on\s+products\.?product_id\s*=\s*stock_movements\.?product_id/i,
        points: 24,
        tip: "Join through product_id.",
      },
      {
        label: "Unmatched filter",
        pattern: /where\s+s\.?product_id\s+is\s+null|where\s+stock_movements\.?product_id\s+is\s+null/i,
        points: 18,
        tip: "Use right table key IS NULL.",
      },
    ],
    bonusRules: [
      {
        label: "Only requested column",
        pattern: /select\s+p\.?product_name|select\s+products\.?product_name/i,
        points: 10,
        tip: "Keep output focused.",
      },
    ],
    quiz: {
      question: "Which join keeps all rows from the left table?",
      options: ["LEFT JOIN", "INNER JOIN", "CROSS JOIN", "RIGHT JOIN only"],
      correctIndex: 0,
      explanation: "LEFT JOIN always keeps the left side, matched or not.",
    },
    datasetPreview: {
      columns: ["product_name", "stock_entry"],
      rows: [
        ["Cable USB-C", "exists"],
        ["Wireless Pad", "exists"],
        ["Drone Bag", "missing"],
      ],
    },
    schema: {
      tables: [
        {
          id: "products",
          name: "products",
          columns: ["product_id PK", "product_name"],
          x: 22,
          y: 50,
        },
        {
          id: "stock_movements",
          name: "stock_movements",
          columns: ["movement_id PK", "product_id FK", "qty_change"],
          x: 76,
          y: 50,
        },
      ],
      links: [{ from: "products", to: "stock_movements", label: "optional stock rows" }],
    },
  },
  {
    id: 6,
    level: 6,
    academy: "Relational",
    title: "Many-to-Many Author Mapper",
    difficulty: "Advanced",
    dialect: "ANSI SQL",
    story:
      "Catalog team needs books and their authors. A junction table controls the relationship.",
    objective:
      "Return book_title and author_name joining books, author_books, and authors.",
    starterQuery:
      "SELECT b.book_title, a.author_name\nFROM books b\nJOIN author_books ab ON b.book_id = ab.book_id\nJOIN authors a ON ab.author_id = a.author_id\nORDER BY b.book_title ASC;",
    solutionQuery:
      "SELECT b.book_title, a.author_name FROM books b JOIN author_books ab ON b.book_id = ab.book_id JOIN authors a ON ab.author_id = a.author_id ORDER BY b.book_title ASC;",
    hints: [
      "Traverse through the junction table author_books.",
      "You need two JOIN clauses.",
    ],
    concepts: [
      "Many-to-many requires an intersection table.",
      "Join order should reflect relationship path.",
    ],
    commonMistakes: [
      "Trying to join books directly to authors without junction.",
      "Joining with wrong key side.",
    ],
    rules: [
      { label: "Read books", pattern: /from\s+books\b/i, points: 15, tip: "Start from books." },
      { label: "Join junction", pattern: /join\s+author_books\b/i, points: 20, tip: "Use author_books bridge." },
      { label: "Join authors", pattern: /join\s+authors\b/i, points: 20, tip: "Connect final authors table." },
      {
        label: "Books to bridge",
        pattern: /on\s+b\.?book_id\s*=\s*ab\.?book_id|on\s+books\.?book_id\s*=\s*author_books\.?book_id/i,
        points: 20,
        tip: "Match book_id with author_books.",
      },
      {
        label: "Bridge to authors",
        pattern: /on\s+ab\.?author_id\s*=\s*a\.?author_id|on\s+author_books\.?author_id\s*=\s*authors\.?author_id/i,
        points: 20,
        tip: "Match author_id with authors.",
      },
    ],
    bonusRules: [
      {
        label: "Readable sort",
        pattern: /order\s+by\s+b\.?book_title\s+asc|order\s+by\s+book_title\s+asc/i,
        points: 10,
        tip: "Sort titles alphabetically for clean output.",
      },
    ],
    quiz: {
      question: "Which table stores M:N links?",
      options: ["Junction/bridge table", "Fact table only", "Dimension table only", "Primary table"],
      correctIndex: 0,
      explanation: "Many-to-many relations are modeled with a dedicated bridge table.",
    },
    datasetPreview: {
      columns: ["book_title", "author_name"],
      rows: [
        ["SQL Deep Dive", "Mihai Ene"],
        ["SQL Deep Dive", "Ioana Dragomir"],
        ["Geo in Practice", "Roxana Ilie"],
      ],
    },
    schema: {
      tables: [
        { id: "books", name: "books", columns: ["book_id PK", "book_title"], x: 20, y: 50 },
        {
          id: "author_books",
          name: "author_books",
          columns: ["book_id FK", "author_id FK"],
          x: 50,
          y: 50,
        },
        { id: "authors", name: "authors", columns: ["author_id PK", "author_name"], x: 80, y: 50 },
      ],
      links: [
        { from: "books", to: "author_books", label: "1 -> N" },
        { from: "author_books", to: "authors", label: "N -> 1" },
      ],
    },
  },
  {
    id: 7,
    level: 7,
    academy: "Analytics",
    title: "Window Ranking Arena",
    difficulty: "Advanced",
    dialect: "PostgreSQL",
    story:
      "Rank each customer order by amount within that customer history.",
    objective:
      "Return customer_id, order_id, total_amount and rank_in_customer using ROW_NUMBER partitioned by customer_id ordered by total_amount desc.",
    starterQuery:
      "SELECT customer_id, order_id, total_amount,\n       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total_amount DESC) AS rank_in_customer\nFROM orders;",
    solutionQuery:
      "SELECT customer_id, order_id, total_amount, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total_amount DESC) AS rank_in_customer FROM orders;",
    hints: [
      "Use ROW_NUMBER() OVER (...).",
      "Partition by customer_id.",
      "Order window by total_amount DESC.",
    ],
    concepts: [
      "Window functions keep row-level detail while adding analytics.",
      "PARTITION BY creates independent ranking groups.",
    ],
    commonMistakes: [
      "Using GROUP BY and losing row-level detail.",
      "Missing ORDER BY in window.",
    ],
    rules: [
      { label: "Read orders", pattern: /from\s+orders\b/i, points: 15, tip: "Source should be orders." },
      { label: "Use ROW_NUMBER", pattern: /row_number\s*\(\s*\)\s*over\s*\(/i, points: 25, tip: "Use ROW_NUMBER window function." },
      {
        label: "Partition",
        pattern: /partition\s+by\s+customer_id/i,
        points: 25,
        tip: "Partition ranking per customer.",
      },
      {
        label: "Order inside window",
        pattern: /order\s+by\s+total_amount\s+desc/i,
        points: 25,
        tip: "Rank by highest amount.",
      },
    ],
    bonusRules: [
      {
        label: "Alias rank",
        pattern: /as\s+rank_in_customer/i,
        points: 10,
        tip: "Use semantic alias for clarity.",
      },
    ],
    quiz: {
      question: "Window functions compared to GROUP BY:",
      options: [
        "Keep original rows and add computed metrics.",
        "Always collapse rows into groups.",
        "Can only be used in MySQL.",
        "Cannot use ORDER BY.",
      ],
      correctIndex: 0,
      explanation: "Window functions compute over sets while preserving rows.",
    },
    datasetPreview: {
      columns: ["customer_id", "order_id", "total_amount", "rank_in_customer"],
      rows: [
        ["1", "2001", "900", "1"],
        ["1", "1995", "720", "2"],
        ["2", "2010", "500", "1"],
      ],
    },
    schema: {
      tables: [
        {
          id: "orders",
          name: "orders",
          columns: ["order_id PK", "customer_id FK", "total_amount"],
          x: 50,
          y: 50,
        },
      ],
      links: [],
    },
  },
  {
    id: 8,
    level: 8,
    academy: "Analytics",
    title: "CTE Revenue Pipeline",
    difficulty: "Advanced",
    dialect: "PostgreSQL",
    story:
      "Use a CTE to pre-aggregate daily totals and then compute a 7-day rolling sum.",
    objective:
      "Build a WITH daily AS (...) query and return sale_day, daily_total, rolling_7d.",
    starterQuery:
      "WITH daily AS (\n  SELECT sale_day, SUM(total_amount) AS daily_total\n  FROM orders\n  GROUP BY sale_day\n)\nSELECT sale_day,\n       daily_total,\n       SUM(daily_total) OVER (ORDER BY sale_day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7d\nFROM daily\nORDER BY sale_day;",
    solutionQuery:
      "WITH daily AS (SELECT sale_day, SUM(total_amount) AS daily_total FROM orders GROUP BY sale_day) SELECT sale_day, daily_total, SUM(daily_total) OVER (ORDER BY sale_day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7d FROM daily ORDER BY sale_day;",
    hints: [
      "Use WITH daily AS (...) to prepare totals.",
      "Window frame for 7 days is 6 PRECEDING to CURRENT ROW.",
    ],
    concepts: [
      "CTEs improve readability for multi-step transformations.",
      "Window frames control temporal range in rolling metrics.",
    ],
    commonMistakes: [
      "Missing GROUP BY inside CTE.",
      "Using PARTITION BY when full timeline is needed.",
    ],
    rules: [
      { label: "Use WITH", pattern: /with\s+daily\s+as\s*\(/i, points: 18, tip: "Start with CTE daily." },
      {
        label: "Aggregate daily",
        pattern: /sum\s*\(\s*total_amount\s*\)\s+as\s+daily_total/i,
        points: 22,
        tip: "Create daily total in CTE.",
      },
      { label: "Group by day", pattern: /group\s+by\s+sale_day/i, points: 20, tip: "Aggregate by sale_day." },
      {
        label: "Rolling window",
        pattern: /rows\s+between\s+6\s+preceding\s+and\s+current\s+row/i,
        points: 20,
        tip: "Define 7-day frame.",
      },
      {
        label: "Window sum",
        pattern: /sum\s*\(\s*daily_total\s*\)\s*over\s*\(/i,
        points: 20,
        tip: "Compute rolling_7d from daily_total.",
      },
    ],
    bonusRules: [
      {
        label: "Final order",
        pattern: /order\s+by\s+sale_day/i,
        points: 10,
        tip: "Keep timeline sorted.",
      },
    ],
    quiz: {
      question: "Why use a CTE here?",
      options: [
        "To split logic into understandable steps.",
        "Because window functions require CTE.",
        "To avoid GROUP BY entirely.",
        "Only SQL Server can read CTEs.",
      ],
      correctIndex: 0,
      explanation: "CTEs are optional but ideal for readable staged SQL.",
    },
    datasetPreview: {
      columns: ["sale_day", "daily_total", "rolling_7d"],
      rows: [
        ["2026-05-20", "1200", "1200"],
        ["2026-05-21", "980", "2180"],
        ["2026-05-22", "1500", "3680"],
      ],
    },
    schema: {
      tables: [
        { id: "orders", name: "orders", columns: ["order_id PK", "sale_day", "total_amount"], x: 50, y: 50 },
      ],
      links: [],
    },
  },
  {
    id: 9,
    level: 9,
    academy: "Analytics",
    title: "Conditional Aggregation",
    difficulty: "Advanced",
    dialect: "ANSI SQL",
    story:
      "You need one report with paid and unpaid invoice counts in the same row per month.",
    objective:
      "Return invoice_month, paid_count, unpaid_count using SUM(CASE WHEN ...).",
    starterQuery:
      "SELECT invoice_month,\n       SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count,\n       SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_count\nFROM invoices\nGROUP BY invoice_month\nORDER BY invoice_month;",
    solutionQuery:
      "SELECT invoice_month, SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count, SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_count FROM invoices GROUP BY invoice_month ORDER BY invoice_month;",
    hints: [
      "Use two CASE expressions, one for paid and one for unpaid.",
      "Group by invoice_month.",
    ],
    concepts: [
      "Conditional aggregation creates pivot-like metrics in one scan.",
      "CASE inside SUM is a standard reporting pattern.",
    ],
    commonMistakes: [
      "Using COUNT(*) with WHERE and needing two separate queries.",
      "Forgetting ELSE 0 and getting NULL totals.",
    ],
    rules: [
      { label: "Read invoices", pattern: /from\s+invoices\b/i, points: 15, tip: "Use invoices table." },
      {
        label: "Paid CASE",
        pattern: /sum\s*\(\s*case\s+when\s+status\s*=\s*'paid'\s+then\s+1\s+else\s+0\s+end\s*\)/i,
        points: 30,
        tip: "Compute paid_count with CASE.",
      },
      {
        label: "Unpaid CASE",
        pattern: /sum\s*\(\s*case\s+when\s+status\s*=\s*'unpaid'\s+then\s+1\s+else\s+0\s+end\s*\)/i,
        points: 30,
        tip: "Compute unpaid_count with CASE.",
      },
      {
        label: "Group by month",
        pattern: /group\s+by\s+invoice_month/i,
        points: 15,
        tip: "Group output by invoice_month.",
      },
    ],
    bonusRules: [
      {
        label: "Sorted month",
        pattern: /order\s+by\s+invoice_month/i,
        points: 10,
        tip: "Sort for reporting readability.",
      },
    ],
    quiz: {
      question: "What does SUM(CASE WHEN ... THEN 1 ELSE 0 END) do?",
      options: [
        "Counts rows matching a condition.",
        "Always returns 1.",
        "Only works with numeric status.",
        "Replaces GROUP BY.",
      ],
      correctIndex: 0,
      explanation: "It behaves like a conditional counter.",
    },
    datasetPreview: {
      columns: ["invoice_month", "paid_count", "unpaid_count"],
      rows: [
        ["2026-04", "42", "7"],
        ["2026-05", "39", "9"],
      ],
    },
    schema: {
      tables: [
        { id: "invoices", name: "invoices", columns: ["invoice_id PK", "invoice_month", "status"], x: 50, y: 50 },
      ],
      links: [],
    },
  },
  {
    id: 10,
    level: 10,
    academy: "Object SQL",
    title: "JSON Device Decoder",
    difficulty: "Advanced",
    dialect: "PostgreSQL",
    story:
      "Device attributes are in jsonb. Pull model and battery for active devices in region RO.",
    objective:
      "Return device_id, model, battery from profile jsonb where status='active' and region='RO'.",
    starterQuery:
      "SELECT d.device_id,\n       d.profile->>'model' AS model,\n       (d.profile->>'battery')::int AS battery\nFROM devices d\nWHERE d.profile->>'status' = 'active'\n  AND d.profile->>'region' = 'RO'\nORDER BY battery DESC;",
    solutionQuery:
      "SELECT d.device_id, d.profile->>'model' AS model, (d.profile->>'battery')::int AS battery FROM devices d WHERE d.profile->>'status' = 'active' AND d.profile->>'region' = 'RO' ORDER BY battery DESC;",
    hints: [
      "Use ->> for text extraction from jsonb.",
      "Cast battery to int for numeric sort.",
    ],
    concepts: [
      "JSONB combines flexibility with relational querying.",
      "Casting helps enforce numeric logic.",
    ],
    commonMistakes: [
      "Using -> instead of ->> and comparing JSON object to text.",
      "Sorting battery as text.",
    ],
    rules: [
      { label: "Read devices", pattern: /from\s+devices\b/i, points: 15, tip: "Use devices table." },
      { label: "Extract model", pattern: /profile\s*->>\s*'model'/i, points: 15, tip: "Read model key." },
      { label: "Extract battery", pattern: /profile\s*->>\s*'battery'/i, points: 15, tip: "Read battery key." },
      { label: "Active filter", pattern: /profile\s*->>\s*'status'\s*=\s*'active'/i, points: 20, tip: "Keep active devices." },
      { label: "Region filter", pattern: /profile\s*->>\s*'region'\s*=\s*'ro'/i, points: 20, tip: "Keep region RO." },
      { label: "Order battery", pattern: /order\s+by\s+battery\s+desc/i, points: 15, tip: "Sort highest battery first." },
    ],
    bonusRules: [
      {
        label: "Integer cast",
        pattern: /\(\s*d\.?profile\s*->>\s*'battery'\s*\)::int/i,
        points: 10,
        tip: "Cast battery to int.",
      },
    ],
    quiz: {
      question: "What does `->>` return in PostgreSQL jsonb?",
      options: ["Text", "JSON object only", "Boolean only", "Array length"],
      correctIndex: 0,
      explanation: "The `->>` operator extracts text.",
    },
    datasetPreview: {
      columns: ["device_id", "model", "battery"],
      rows: [
        ["D-21", "Atlas X", "95"],
        ["D-19", "Nova Mini", "82"],
      ],
    },
    schema: {
      tables: [
        { id: "devices", name: "devices", columns: ["device_id PK", "profile jsonb"], x: 50, y: 50 },
      ],
      links: [],
    },
  },
  {
    id: 11,
    level: 11,
    academy: "Object SQL",
    title: "JSON Tag Filter",
    difficulty: "Advanced",
    dialect: "PostgreSQL",
    story:
      "Marketing wants events tagged with both 'promo' and 'mobile'. Tags live inside jsonb arrays.",
    objective:
      "Return event_id and event_name where metadata->'tags' contains both promo and mobile.",
    starterQuery:
      "SELECT event_id, event_name\nFROM events\nWHERE metadata->'tags' @> '[\"promo\", \"mobile\"]'::jsonb;",
    solutionQuery:
      "SELECT event_id, event_name FROM events WHERE metadata->'tags' @> '[\"promo\", \"mobile\"]'::jsonb;",
    hints: [
      "Use @> containment for jsonb arrays.",
      "Target metadata->'tags'.",
    ],
    concepts: [
      "jsonb containment supports powerful set checks.",
      "GIN indexes can speed up containment queries.",
    ],
    commonMistakes: [
      "Comparing full JSON text manually.",
      "Using ->> and losing array semantics.",
    ],
    rules: [
      { label: "Read events", pattern: /from\s+events\b/i, points: 20, tip: "Use events table." },
      { label: "Tag path", pattern: /metadata\s*->\s*'tags'/i, points: 25, tip: "Navigate to tags array." },
      { label: "Containment operator", pattern: /@>\s*'\[\"promo\",\s*\"mobile\"\]'\s*::jsonb/i, points: 35, tip: "Use jsonb containment with both tags." },
    ],
    bonusRules: [
      {
        label: "Narrow output",
        pattern: /select\s+event_id\s*,\s*event_name/i,
        points: 10,
        tip: "Return only requested columns.",
      },
    ],
    quiz: {
      question: "Which PostgreSQL operator checks jsonb containment?",
      options: ["@>", "->>", "||", "#>>"],
      correctIndex: 0,
      explanation: "`@>` is the containment operator for json/jsonb.",
    },
    datasetPreview: {
      columns: ["event_id", "event_name", "tags"],
      rows: [
        ["E-11", "Summer Launch", "[promo,mobile]"],
        ["E-12", "Store Training", "[internal]"],
      ],
    },
    schema: {
      tables: [
        { id: "events", name: "events", columns: ["event_id PK", "event_name", "metadata jsonb"], x: 50, y: 50 },
      ],
      links: [],
    },
  },
  {
    id: 12,
    level: 12,
    academy: "Spatial SQL",
    title: "Hub Radius Scan",
    difficulty: "Legend",
    dialect: "PostGIS",
    story:
      "Dispatch needs checkpoints located within 5 km of the Bucharest Hub.",
    objective:
      "Return checkpoint_name and distance_km for checkpoints within 5000 meters from Bucharest Hub.",
    starterQuery:
      "SELECT p.checkpoint_name,\n       ROUND(ST_Distance(p.geom::geography, d.geom::geography)/1000, 2) AS distance_km\nFROM checkpoints p\nJOIN depots d ON d.depot_name = 'Bucharest Hub'\nWHERE ST_DWithin(p.geom::geography, d.geom::geography, 5000)\nORDER BY distance_km ASC;",
    solutionQuery:
      "SELECT p.checkpoint_name, ROUND(ST_Distance(p.geom::geography, d.geom::geography)/1000, 2) AS distance_km FROM checkpoints p JOIN depots d ON d.depot_name = 'Bucharest Hub' WHERE ST_DWithin(p.geom::geography, d.geom::geography, 5000) ORDER BY distance_km ASC;",
    hints: [
      "Use ST_DWithin for fast radius filtering.",
      "Cast to geography for meter units.",
    ],
    concepts: [
      "Spatial predicates can use GiST indexes effectively.",
      "Distance units depend on geometry vs geography types.",
    ],
    commonMistakes: [
      "Skipping geography cast and getting degree-based numbers.",
      "Filtering hub in WHERE but forgetting depot join.",
    ],
    rules: [
      { label: "Read checkpoints", pattern: /from\s+checkpoints\b/i, points: 12, tip: "Main location set is checkpoints." },
      { label: "Join depots", pattern: /join\s+depots\b/i, points: 14, tip: "Use depots as reference location." },
      { label: "Hub row filter", pattern: /depot_name\s*=\s*'bucharest hub'/i, points: 16, tip: "Pin Bucharest Hub." },
      { label: "ST_DWithin", pattern: /st_dwithin\s*\(/i, points: 20, tip: "Use ST_DWithin for radius." },
      { label: "Radius 5000m", pattern: /st_dwithin\s*\([^\)]*,\s*5000\s*\)/i, points: 16, tip: "Radius must be 5000 meters." },
      { label: "Distance output", pattern: /st_distance\s*\(/i, points: 12, tip: "Return explicit distance." },
      { label: "Nearest first", pattern: /order\s+by\s+distance_km\s+asc/i, points: 10, tip: "Sort by smallest distance." },
    ],
    bonusRules: [
      {
        label: "Round distance",
        pattern: /round\s*\(\s*st_distance/i,
        points: 10,
        tip: "Rounded kilometers are easier to read.",
      },
    ],
    quiz: {
      question: "Why use ST_DWithin instead of only ST_Distance < x?",
      options: [
        "ST_DWithin is index-friendly and optimized for radius checks.",
        "ST_DWithin is required to join tables.",
        "ST_Distance cannot compare numbers.",
        "ST_DWithin only works in SQL Server.",
      ],
      correctIndex: 0,
      explanation: "ST_DWithin is usually preferred for radius filters with spatial indexes.",
    },
    datasetPreview: {
      columns: ["checkpoint_name", "distance_km"],
      rows: [
        ["Checkpoint Nord", "1.42"],
        ["Checkpoint Unirii", "3.88"],
      ],
    },
    schema: {
      tables: [
        { id: "checkpoints", name: "checkpoints", columns: ["checkpoint_id PK", "checkpoint_name", "geom geometry"], x: 24, y: 50 },
        { id: "depots", name: "depots", columns: ["depot_id PK", "depot_name", "geom geometry"], x: 74, y: 50 },
      ],
      links: [{ from: "checkpoints", to: "depots", label: "distance relation" }],
    },
  },
  {
    id: 13,
    level: 13,
    academy: "Spatial SQL",
    title: "Zone Intersection Probe",
    difficulty: "Legend",
    dialect: "PostGIS",
    story:
      "Risk team needs routes that intersect restricted zones for compliance review.",
    objective:
      "Return route_id where route_geom intersects zone_geom from restricted_zones.",
    starterQuery:
      "SELECT r.route_id\nFROM routes r\nJOIN restricted_zones z ON ST_Intersects(r.route_geom, z.zone_geom);",
    solutionQuery:
      "SELECT r.route_id FROM routes r JOIN restricted_zones z ON ST_Intersects(r.route_geom, z.zone_geom);",
    hints: [
      "Use ST_Intersects in the ON clause or WHERE clause.",
      "Join routes to restricted_zones.",
    ],
    concepts: [
      "Spatial joins use geometric predicates as relationship keys.",
      "ST_Intersects returns true when geometries overlap.",
    ],
    commonMistakes: [
      "Comparing geometry columns with '='.",
      "Using cartesian product and filtering outside any predicate.",
    ],
    rules: [
      { label: "Read routes", pattern: /from\s+routes\b/i, points: 20, tip: "Use routes as source." },
      { label: "Join zones", pattern: /join\s+restricted_zones\b/i, points: 20, tip: "Bring restricted zones." },
      { label: "Spatial predicate", pattern: /st_intersects\s*\(\s*r\.?route_geom\s*,\s*z\.?zone_geom\s*\)|st_intersects\s*\(\s*route_geom\s*,\s*zone_geom\s*\)/i, points: 40, tip: "Use ST_Intersects between route and zone geometry." },
    ],
    bonusRules: [
      {
        label: "Distinct route ids",
        pattern: /select\s+distinct\s+r\.?route_id|select\s+distinct\s+route_id/i,
        points: 10,
        tip: "Optional dedupe when one route intersects multiple zones.",
      },
    ],
    quiz: {
      question: "Spatial join key equivalent is usually:",
      options: ["A predicate like ST_Intersects", "An integer hash only", "A text collation", "A trigger name"],
      correctIndex: 0,
      explanation: "Spatial joins are predicate-based, not only ID-based.",
    },
    datasetPreview: {
      columns: ["route_id", "intersects_zone"],
      rows: [
        ["R-77", "true"],
        ["R-14", "false"],
      ],
    },
    schema: {
      tables: [
        { id: "routes", name: "routes", columns: ["route_id PK", "route_geom geometry"], x: 24, y: 50 },
        { id: "restricted_zones", name: "restricted_zones", columns: ["zone_id PK", "zone_geom geometry"], x: 74, y: 50 },
      ],
      links: [{ from: "routes", to: "restricted_zones", label: "ST_Intersects" }],
    },
  },
  {
    id: 14,
    level: 14,
    academy: "SGBD",
    title: "Cross-Engine Pagination",
    difficulty: "Legend",
    dialect: "SQL Server + PostgreSQL",
    story:
      "Your app supports multiple engines. Write SQL Server pagination and note PostgreSQL equivalent.",
    objective:
      "Write SQL Server query using ORDER BY issued_at DESC OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY and include a comment with PostgreSQL LIMIT 10.",
    starterQuery:
      "SELECT invoice_id, issued_at, total\nFROM invoices\nORDER BY issued_at DESC\nOFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;\n-- PostgreSQL equivalent: SELECT invoice_id, issued_at, total FROM invoices ORDER BY issued_at DESC LIMIT 10;",
    solutionQuery:
      "SELECT invoice_id, issued_at, total FROM invoices ORDER BY issued_at DESC OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY; -- PostgreSQL equivalent: ... LIMIT 10",
    hints: [
      "SQL Server pagination uses OFFSET/FETCH with ORDER BY.",
      "Keep PostgreSQL LIMIT note in comment.",
    ],
    concepts: [
      "Dialect portability needs explicit syntax mapping.",
      "Pagination clauses differ widely by engine/version.",
    ],
    commonMistakes: [
      "Using LIMIT in the SQL Server main statement.",
      "Missing ORDER BY before OFFSET/FETCH.",
    ],
    rules: [
      { label: "Read invoices", pattern: /from\s+invoices\b/i, points: 15, tip: "Source table is invoices." },
      { label: "Sort issued_at desc", pattern: /order\s+by\s+issued_at\s+desc/i, points: 25, tip: "Sort newest first." },
      { label: "Offset fetch clause", pattern: /offset\s+0\s+rows\s+fetch\s+next\s+10\s+rows\s+only/i, points: 35, tip: "Use SQL Server paging syntax." },
      { label: "PostgreSQL note", pattern: /postgresql equivalent:.*limit\s+10/i, points: 15, tip: "Comment should mention LIMIT 10 equivalent." },
    ],
    bonusRules: [
      {
        label: "No SELECT *",
        pattern: /select\s+(?!\*)/i,
        points: 10,
        tip: "Return explicit fields.",
      },
    ],
    quiz: {
      question: "In SQL Server, OFFSET/FETCH requires:",
      options: ["ORDER BY", "GROUP BY", "HAVING", "DISTINCT"],
      correctIndex: 0,
      explanation: "OFFSET/FETCH is tied to ORDER BY in SQL Server.",
    },
    datasetPreview: {
      columns: ["invoice_id", "issued_at", "total"],
      rows: [
        ["A-508", "2026-05-27", "890"],
        ["A-507", "2026-05-26", "620"],
      ],
    },
    schema: {
      tables: [
        { id: "invoices", name: "invoices", columns: ["invoice_id PK", "issued_at", "total"], x: 50, y: 50 },
      ],
      links: [],
    },
  },
  {
    id: 15,
    level: 15,
    academy: "SGBD",
    title: "PostgreSQL Upsert Master",
    difficulty: "Legend",
    dialect: "PostgreSQL",
    story:
      "You must synchronize user settings safely. Insert new rows and update existing ones in one command.",
    objective:
      "Write INSERT ... ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, updated_at = NOW().",
    starterQuery:
      "INSERT INTO user_settings (user_id, theme, updated_at)\nVALUES (42, 'dark', NOW())\nON CONFLICT (user_id)\nDO UPDATE SET\n  theme = EXCLUDED.theme,\n  updated_at = NOW();",
    solutionQuery:
      "INSERT INTO user_settings (user_id, theme, updated_at) VALUES (42, 'dark', NOW()) ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, updated_at = NOW();",
    hints: [
      "Conflict target should be (user_id).",
      "Use EXCLUDED.theme to reference incoming row.",
    ],
    concepts: [
      "Upsert prevents race-prone read-then-write flows.",
      "EXCLUDED exposes attempted insert values in conflict update.",
    ],
    commonMistakes: [
      "Missing conflict target columns.",
      "Trying ON CONFLICT in engines without support.",
    ],
    rules: [
      { label: "Insert user_settings", pattern: /insert\s+into\s+user_settings\b/i, points: 20, tip: "Insert into user_settings." },
      { label: "Conflict target", pattern: /on\s+conflict\s*\(\s*user_id\s*\)/i, points: 25, tip: "Use user_id conflict target." },
      { label: "Do update", pattern: /do\s+update\s+set/i, points: 20, tip: "Upsert must update existing row." },
      { label: "Use EXCLUDED.theme", pattern: /theme\s*=\s*excluded\.theme/i, points: 25, tip: "Update theme from incoming row." },
    ],
    bonusRules: [
      {
        label: "Touch updated_at",
        pattern: /updated_at\s*=\s*now\s*\(\s*\)/i,
        points: 10,
        tip: "Refresh updated_at on update.",
      },
    ],
    quiz: {
      question: "What is EXCLUDED in PostgreSQL upsert?",
      options: [
        "The row proposed for insert during conflict handling.",
        "A deleted row shadow table.",
        "A SQL Server temporary alias.",
        "A required index name.",
      ],
      correctIndex: 0,
      explanation: "EXCLUDED contains values from the attempted INSERT row.",
    },
    datasetPreview: {
      columns: ["user_id", "theme", "updated_at"],
      rows: [
        ["42", "light", "2026-05-25 10:11"],
        ["42", "dark", "2026-05-28 09:05"],
      ],
    },
    schema: {
      tables: [
        {
          id: "user_settings",
          name: "user_settings",
          columns: ["user_id PK/UK", "theme", "updated_at"],
          x: 50,
          y: 50,
        },
      ],
      links: [],
    },
  },
];
