export const metadata = { title: 'BudgetWise – Home' }

export default function HomePage() {
  return (
    <>
      <h1 style={{ margin: '4px 0 16px' }}>Home</h1>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Budget Overview */}
        <section className="card">
          <div className="section-title">Budget Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p>Total Balance: <strong>$xx</strong></p>
              <p>Budget Used: <span style={{ color: '#ef4444' }}>$xx</span></p>
              <p>Remaining: <span style={{ color: '#16a34a' }}>$xx</span></p>
              <div className="progress" style={{ marginTop: 8 }}><span style={{ width: '64%' }} /></div>
              <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                <a className="button primary" href="/dashboard/transactions">View Transactions</a>
                <a className="button ghost" href="/dashboard/budget">Manage Budgets</a>
              </div>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <div className="section-title">Spending Categories</div>
              <div className="chart" />
            </div>
          </div>
        </section>
      </div>

      {/* Quick cards (goals etc.) */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <section className="card"><div className="section-title">xxx</div><div className="progress"><span style={{width:'30%'}} /></div></section>
        <section className="card"><div className="section-title">xxx</div><div className="progress"><span style={{width:'55%'}} /></div></section>
      </div>

      {/* Recent Transactions table (placeholder) */}
      <section className="card">
        <div className="section-title">Recent Transactions</div>
        <table className="table">
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>
          </tbody>
        </table>
      </section>
    </>
  )
}