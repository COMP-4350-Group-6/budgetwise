export default function Home() {
  return (
    <>
      <h1 style={{ margin: '4px 0 16px' }}>Home</h1>

      {/* Budget Overview + Categories */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <section className="card">
          <div className="section-title">Budget Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
            <div>
              <div className="skel h32 w60 round" />
              <div style={{ marginTop: 12 }} className="progress"><span style={{ width: '64%' }} /></div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button className="button primary">View Transactions</button>
                <button className="button ghost">Manage Budgets</button>
              </div>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <div className="section-title">Spending Categories</div>
              <div className="chart" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                <span className="badge">Category A</span>
                <span className="badge">Category B</span>
                <span className="badge">Category C</span>
                <span className="badge">Category D</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Goals row */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        {['Goal A', 'Goal B', 'Goal C', 'Goal D'].map((t, i) => (
          <section className="card" key={t}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{t}</div>
            <div className="progress"><span style={{ width: [30, 48, 20, 60][i] + '%' }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              <span className="skel h12 w40 round" />
              <a href="#">View →</a>
            </div>
          </section>
        ))}
      </div>

      {/* Recent Transactions */}
      <section className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">Recent Transactions</div>
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {/* TODO: render latest 5 items */}
            <tr><td colSpan={4}><div className="skel h16 w100" /></td></tr>
          </tbody>
        </table>
      </section>

      {/* Quick Actions */}
      <section className="card">
        <div className="section-title">Quick Actions</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="button primary">+ Add Transaction</button>
          <button className="button ghost">+ New Goal</button>
        </div>
      </section>
    </>
  )
}