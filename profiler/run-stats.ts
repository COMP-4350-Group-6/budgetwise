import fs from 'fs';
import path from 'path';
import { OpenRouterInvoiceParser, OpenRouterCategorization } from '../packages/adapters/services/openrouter/src/index';
import { CategoryInfo } from '../packages/ports/src/index';

interface StatsResult {
  name: string;
  totalRuns: number;
  successCount: number;
  successRate: number;
  times: number[];           // sorted for statistics
  chronologicalTimes: number[]; // original order for timeline
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  q1: number;
  q3: number;
  p90: number;
  p95: number;
  p99: number;
}

const allResults: StatsResult[] = [];

// Load environment variables from apps/api/.dev.vars
const envPath = path.resolve(__dirname, '../apps/api/.dev.vars');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error('Error: OPENROUTER_API_KEY not found in .env file');
  process.exit(1);
}

const INVOICE_DIR = path.join(__dirname, 'invoices');

// Mock categories for context (30 categories - worst case scenario)
const MOCK_CATEGORIES: CategoryInfo[] = [
  { id: 'cat_1', name: 'Groceries', icon: '🥦' },
  { id: 'cat_2', name: 'Dining Out', icon: '🍔' },
  { id: 'cat_3', name: 'Transportation', icon: '🚗' },
  { id: 'cat_4', name: 'Entertainment', icon: '🎬' },
  { id: 'cat_5', name: 'Utilities', icon: '💡' },
  { id: 'cat_6', name: 'Rent', icon: '🏠' },
  { id: 'cat_7', name: 'Healthcare', icon: '🏥' },
  { id: 'cat_8', name: 'Shopping', icon: '🛍️' },
  { id: 'cat_9', name: 'Travel', icon: '✈️' },
  { id: 'cat_10', name: 'Education', icon: '📚' },
  { id: 'cat_11', name: 'Coffee & Cafes', icon: '☕' },
  { id: 'cat_12', name: 'Fast Food', icon: '🍟' },
  { id: 'cat_13', name: 'Gas & Fuel', icon: '⛽' },
  { id: 'cat_14', name: 'Public Transit', icon: '🚌' },
  { id: 'cat_15', name: 'Ride Share', icon: '🚕' },
  { id: 'cat_16', name: 'Parking', icon: '🅿️' },
  { id: 'cat_17', name: 'Subscriptions', icon: '📺' },
  { id: 'cat_18', name: 'Streaming Services', icon: '🎵' },
  { id: 'cat_19', name: 'Gaming', icon: '🎮' },
  { id: 'cat_20', name: 'Fitness & Gym', icon: '💪' },
  { id: 'cat_21', name: 'Personal Care', icon: '💅' },
  { id: 'cat_22', name: 'Pharmacy', icon: '💊' },
  { id: 'cat_23', name: 'Insurance', icon: '🛡️' },
  { id: 'cat_24', name: 'Phone & Internet', icon: '📱' },
  { id: 'cat_25', name: 'Home Improvement', icon: '🔨' },
  { id: 'cat_26', name: 'Electronics', icon: '💻' },
  { id: 'cat_27', name: 'Clothing & Apparel', icon: '👕' },
  { id: 'cat_28', name: 'Pet Supplies', icon: '🐕' },
  { id: 'cat_29', name: 'Gifts & Donations', icon: '🎁' },
  { id: 'cat_30', name: 'Miscellaneous', icon: '📦' },
];

// 30 Transactions for testing
const TRANSACTIONS = [
  { note: 'Starbucks', amount: 550 },
  { note: 'Uber Ride', amount: 2450 },
  { note: 'Netflix Subscription', amount: 1599 },
  { note: 'Walmart Grocery', amount: 12500 },
  { note: 'Shell Gas Station', amount: 4500 },
  { note: 'Spotify', amount: 999 },
  { note: 'Amazon Purchase', amount: 3450 },
  { note: 'McDonalds', amount: 1250 },
  { note: 'Cineplex Odeon', amount: 2800 },
  { note: 'Hydro Bill', amount: 8500 },
  { note: 'Rent Payment', amount: 150000 },
  { note: 'Shoppers Drug Mart', amount: 1850 },
  { note: 'Air Canada Flight', amount: 45000 },
  { note: 'University Tuition', amount: 500000 },
  { note: 'Gym Membership', amount: 4500 },
  { note: 'Apple Store', amount: 120000 },
  { note: 'Tim Hortons', amount: 350 },
  { note: 'Subway', amount: 1100 },
  { note: 'Costco Wholesale', amount: 35000 },
  { note: 'IKEA', amount: 15000 },
  { note: 'Home Depot', amount: 4500 },
  { note: 'Best Buy', amount: 8900 },
  { note: 'Zara', amount: 6500 },
  { note: 'H&M', amount: 4500 },
  { note: 'Nike', amount: 12000 },
  { note: 'Adidas', amount: 11000 },
  { note: 'Lululemon', amount: 9800 },
  { note: 'Sephora', amount: 5500 },
  { note: 'PlayStation Network', amount: 7999 },
  { note: 'Steam Games', amount: 4500 },
];

async function runStats() {
  console.log('Starting BudgetWise LLM Performance Profiler...');
  console.log('---------------------------------------------');

  const invoiceParser = new OpenRouterInvoiceParser(API_KEY!);
  const categorizer = new OpenRouterCategorization(API_KEY!);

  // --- Categorization Stats (First) ---
  console.log('\nPhase 1: Auto-Categorization (100 runs)');
  const catTimes: number[] = [];
  let catSuccess = 0;

  for (let i = 0; i < 100; i++) {
    const tx = TRANSACTIONS[Math.floor(Math.random() * TRANSACTIONS.length)];
    
    const start = performance.now();
    try {
      process.stdout.write(`\rCategorization Run ${i + 1}/100: "${tx.note}"...`);
      const result = await categorizer.categorizeTransaction(tx.note, tx.amount, MOCK_CATEGORIES);
      const duration = performance.now() - start;
      
      if (result) {
        catTimes.push(duration);
        catSuccess++;
      }
    } catch (e) {
      console.error(`\nError categorizing "${tx.note}":`, e);
    }
  }
  console.log('\nCategorization Complete.');
  calculateStats('Auto-Categorization', catTimes, catSuccess, 100);

  // --- Invoice Parsing Stats (Second) ---
  console.log('\nPhase 2: Invoice Parsing (20 runs)');
  const invoiceFiles = fs.readdirSync(INVOICE_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  if (invoiceFiles.length === 0) {
    console.warn('⚠️ No invoice images found in profiler/invoices. Skipping invoice tests.');
  } else {
    const invoiceTimes: number[] = [];
    let invoiceSuccess = 0;

    for (let i = 0; i < 20; i++) {
      const file = invoiceFiles[Math.floor(Math.random() * invoiceFiles.length)];
      const filePath = path.join(INVOICE_DIR, file);
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString('base64');

      const start = performance.now();
      try {
        process.stdout.write(`\rInvoice Run ${i + 1}/20: Processing ${file}...`);
        const result = await invoiceParser.parseInvoice(base64Image, MOCK_CATEGORIES);
        const duration = performance.now() - start;
        
        if (result) {
          invoiceTimes.push(duration);
          invoiceSuccess++;
        }
      } catch (e) {
        console.error(`\nError parsing invoice ${file}:`, e);
      }
    }
    console.log('\nInvoice Parsing Complete.');
    calculateStats('Invoice Parsing', invoiceTimes, invoiceSuccess, 20);
  }

  // Generate HTML report with charts
  generateHTML();
}

function calculateStats(name: string, times: number[], successCount: number, totalRuns: number): StatsResult | null {
  if (times.length === 0) {
    console.log('No successful runs to calculate stats.');
    return null;
  }

  const sorted = [...times].sort((a, b) => a - b);
  const n = sorted.length;
  
  // Basic stats
  const min = sorted[0];
  const max = sorted[n - 1];
  const mean = times.reduce((a, b) => a + b, 0) / n;
  
  // Median (Q2)
  const median = n % 2 === 0
    ? (sorted[n/2 - 1] + sorted[n/2]) / 2
    : sorted[Math.floor(n/2)];
  
  // Quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  
  // Percentiles
  const p90 = sorted[Math.floor(n * 0.90)] || max;
  const p95 = sorted[Math.floor(n * 0.95)] || max;
  const p99 = sorted[Math.floor(n * 0.99)] || max;
  
  // Variance and Standard Deviation
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const result: StatsResult = {
    name,
    totalRuns,
    successCount,
    successRate: (successCount / totalRuns) * 100,
    times: sorted,
    chronologicalTimes: times, // preserve original order
    min,
    max,
    mean,
    median,
    stdDev,
    variance,
    q1,
    q3,
    p90,
    p95,
    p99
  };

  allResults.push(result);

  console.log(`
  Results for ${name}:
  ${'='.repeat(40)}
  Total Runs:      ${totalRuns}
  Successful:      ${successCount} (${result.successRate.toFixed(1)}%)
  
  Central Tendency:
  -----------------
  Mean:            ${mean.toFixed(2)} ms
  Median (Q2):     ${median.toFixed(2)} ms
  
  Spread:
  -------
  Min:             ${min.toFixed(2)} ms
  Max:             ${max.toFixed(2)} ms
  Std Dev:         ${stdDev.toFixed(2)} ms
  Variance:        ${variance.toFixed(2)} ms²
  
  Quartiles:
  ----------
  Q1 (25th):       ${q1.toFixed(2)} ms
  Q2 (50th):       ${median.toFixed(2)} ms
  Q3 (75th):       ${q3.toFixed(2)} ms
  IQR:             ${(q3 - q1).toFixed(2)} ms
  
  Percentiles:
  ------------
  P90:             ${p90.toFixed(2)} ms
  P95:             ${p95.toFixed(2)} ms
  P99:             ${p99.toFixed(2)} ms
  `);

  return result;
}

function generateHTML() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(__dirname, `report-${timestamp}.html`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BudgetWise LLM Performance Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 30px; color: #333; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card h3 { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .stat-card .value { font-size: 24px; font-weight: bold; color: #333; }
    .stat-card .unit { font-size: 12px; color: #999; }
    .chart-container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 900px) { .chart-row { grid-template-columns: 1fr; } }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #333; }
    canvas { max-height: 300px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 BudgetWise LLM Performance Report</h1>
    <p style="text-align: center; color: #666; margin-bottom: 30px;">Generated: ${new Date().toLocaleString()}</p>
    
    ${allResults.map((result, index) => `
    <h2 style="margin: 30px 0 15px;">${result.name}</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Success Rate</h3>
        <div class="value">${result.successRate.toFixed(1)}<span class="unit">%</span></div>
      </div>
      <div class="stat-card">
        <h3>Mean Latency</h3>
        <div class="value">${result.mean.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="stat-card">
        <h3>Median (P50)</h3>
        <div class="value">${result.median.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="stat-card">
        <h3>P95 Latency</h3>
        <div class="value">${result.p95.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="stat-card">
        <h3>Min</h3>
        <div class="value">${result.min.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="stat-card">
        <h3>Max</h3>
        <div class="value">${result.max.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="stat-card">
        <h3>Std Deviation</h3>
        <div class="value">${result.stdDev.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="stat-card">
        <h3>IQR (Q3-Q1)</h3>
        <div class="value">${(result.q3 - result.q1).toFixed(0)}<span class="unit">ms</span></div>
      </div>
    </div>
    
    <div class="chart-row">
      <div class="chart-container">
        <div class="section-title">Latency Distribution (Histogram)</div>
        <canvas id="histogram-${index}"></canvas>
      </div>
      <div class="chart-container">
        <div class="section-title">Box Plot Data</div>
        <canvas id="boxplot-${index}"></canvas>
      </div>
    </div>
    
    <div class="chart-container">
      <div class="section-title">Response Time Over Runs</div>
      <canvas id="timeline-${index}"></canvas>
    </div>
    `).join('')}
  </div>

  <script>
    const results = ${JSON.stringify(allResults)};
    
    results.forEach((result, index) => {
      // Histogram
      const bins = 15;
      const binSize = (result.max - result.min) / bins;
      const histogram = new Array(bins).fill(0);
      result.times.forEach(t => {
        const binIndex = Math.min(Math.floor((t - result.min) / binSize), bins - 1);
        histogram[binIndex]++;
      });
      const labels = histogram.map((_, i) => (result.min + i * binSize).toFixed(0));
      
      new Chart(document.getElementById('histogram-' + index), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Frequency',
            data: histogram,
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { title: { display: true, text: 'Latency (ms)' } },
            y: { title: { display: true, text: 'Count' } }
          }
        }
      });
      
      // Box plot visualization using floating bars
      const boxplotCtx = document.getElementById('boxplot-' + index);
      new Chart(boxplotCtx, {
        type: 'bar',
        data: {
          labels: [result.name],
          datasets: [
            // Lower whisker (Min to Q1)
            {
              label: 'Min → Q1',
              data: [[result.min, result.q1]],
              backgroundColor: 'rgba(156, 163, 175, 0.3)',
              borderColor: 'rgba(107, 114, 128, 1)',
              borderWidth: 1,
              barPercentage: 0.3,
            },
            // Box (Q1 to Q3)
            {
              label: 'Q1 → Q3 (IQR)',
              data: [[result.q1, result.q3]],
              backgroundColor: 'rgba(99, 102, 241, 0.7)',
              borderColor: 'rgba(99, 102, 241, 1)',
              borderWidth: 2,
              barPercentage: 0.6,
            },
            // Upper whisker (Q3 to Max)
            {
              label: 'Q3 → Max',
              data: [[result.q3, result.max]],
              backgroundColor: 'rgba(156, 163, 175, 0.3)',
              borderColor: 'rgba(107, 114, 128, 1)',
              borderWidth: 1,
              barPercentage: 0.3,
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const range = context.raw;
                  return context.dataset.label + ': ' + range[0].toFixed(0) + ' - ' + range[1].toFixed(0) + ' ms';
                }
              }
            },
            annotation: {
              annotations: {
                medianLine: {
                  type: 'line',
                  xMin: result.median,
                  xMax: result.median,
                  borderColor: 'rgba(239, 68, 68, 1)',
                  borderWidth: 3,
                  label: {
                    display: true,
                    content: 'Median: ' + result.median.toFixed(0) + 'ms',
                    position: 'start'
                  }
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Latency (ms)' },
              min: Math.floor(result.min * 0.9),
              max: Math.ceil(result.max * 1.1)
            },
            y: { stacked: false }
          }
        }
      });
      
      // Add median line manually with canvas
      const boxChart = Chart.getChart(boxplotCtx);
      const medianX = boxChart.scales.x.getPixelForValue(result.median);
      const ctx = boxplotCtx.getContext('2d');
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(medianX, boxChart.chartArea.top);
      ctx.lineTo(medianX, boxChart.chartArea.bottom);
      ctx.stroke();
      ctx.restore();
      
      // Timeline (using chronological order)
      new Chart(document.getElementById('timeline-' + index), {
        type: 'line',
        data: {
          labels: result.chronologicalTimes.map((_, i) => i + 1),
          datasets: [{
            label: 'Response Time (ms)',
            data: result.chronologicalTimes,
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 2
          }, {
            label: 'Mean',
            data: result.chronologicalTimes.map(() => result.mean),
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderDash: [5, 5],
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: 'Run #' } },
            y: { title: { display: true, text: 'Latency (ms)' } }
          }
        }
      });
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  console.log(`\\n📊 Report generated: ${outputPath}`);
  return outputPath;
}

runStats().catch(console.error);