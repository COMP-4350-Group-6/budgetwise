import styles from './page.module.css'

export const metadata = { title: 'BudgetWise – Home' }

export default function HomePage() {
  return (
    <>
      <h1 className={styles.heading}>Home</h1>

      <div className={`grid-2 ${styles.mb16}`}>
        {/* Budget Overview */}
        <section className="card">
          <div className="section-title">Budget Overview</div>

          <div className={styles.overviewGrid}>
            <div>
              <p>
                Total Balance: <strong>$xx</strong>
              </p>
              <p>
                Budget Used: <span className={styles.danger}>$xx</span>
              </p>
              <p>
                Remaining: <span className={styles.ok}>$xx</span>
              </p>

              <div className={`progress ${styles.mt8}`}>
                <span className={styles.w64} />
              </div>

              <div className={styles.btnRow}>
                <a className="button primary" href="/dashboard/transactions">
                  View Transactions
                </a>
                <a className="button ghost" href="/dashboard/budget">
                  Manage Budgets
                </a>
              </div>
            </div>

            <div className={`card ${styles.innerCard}`}>
              <div className="section-title">Spending Categories</div>
              <div className="chart" />
            </div>
          </div>
        </section>
      </div>

      {/* Quick cards (goals etc.) */}
      <div className={`grid-4 ${styles.mb16}`}>
        <section className="card">
          <div className="section-title">xxx</div>
          <div className="progress">
            <span className={styles.w30} />
          </div>
        </section>

        <section className="card">
          <div className="section-title">xxx</div>
          <div className="progress">
            <span className={styles.w55} />
          </div>
        </section>
      </div>

      {/* Recent Transactions table (placeholder) */}
      <section className="card">
        <div className="section-title">Recent Transactions</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>{/* placeholder */}</tbody>
        </table>
      </section>
    </>
  )
}