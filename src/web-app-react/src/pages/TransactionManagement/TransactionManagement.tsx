export default function TransactionManagement() {
  return (
    <>
      <h1 style={{ margin: '4px 0 16px' }}>Transaction Management</h1>

      {/* Add New Transaction */}
      <section className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">Add New Transaction</div>
        <form>
          <div className="form-row">
            <div>
              <label>Description</label>
              <input placeholder="e.g., Coffee" />
            </div>
            <div>
              <label>Amount</label>
              <input type="number" placeholder="$ 0.00" />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Category</label>
              <select><option>—</option><option>Food</option><option>Utilities</option></select>
            </div>
            <div>
              <label>Date</label>
              <input type="date" />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Payment Type</label>
              <select><option>—</option><option>Debit</option><option>Credit</option></select>
            </div>
            <div>
              <label>Notes (Optional)</label>
              <input placeholder="…" />
            </div>
          </div>
          {/* TODO: wire submit handler */}
          <button className="button primary" type="button">Add Transaction</button>
        </form>
      </section>

      {/* Recent Transactions */}
      <section className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">Recent Transactions</div>
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Payment</th><th>Amount</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {/* TODO: render table rows */}
            <tr><td colSpan={6}><div className="skel h16 w100" /></td></tr>
          </tbody>
        </table>
      </section>

      {/* Recurring Payments */}
      <section className="card">
        <div className="section-title">Recurring Payments & Subscriptions</div>
        <table className="table">
          <thead>
            <tr><th>Service</th><th>Category</th><th>Frequency</th><th>Next Due</th><th>Amount</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {/* TODO: render recurring items */}
            <tr><td colSpan={6}><div className="skel h16 w100" /></td></tr>
          </tbody>
        </table>
      </section>
    </>
  )
}