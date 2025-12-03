# LLM Performance Profiler

Benchmarking tools for BudgetWise AI-powered features.

## Overview

This profiler measures the performance of LLM/AI features:
- **Auto-Categorization** - AI-powered transaction categorization
- **Invoice Parsing** - AI-powered receipt/invoice OCR (vision model)

## Quick Start

```sh
cd profiler
npx tsx run-stats.ts
```

## Prerequisites

1. **API environment configured** - Ensure `apps/api/.dev.vars` has:
   ```env
   OPENROUTER_API_KEY=your-openrouter-key
   ```

2. **Test invoices** - Place invoice images in `profiler/invoices/`:
   - `invoice_1_grocery.jpg`
   - `invoice_2_digital.png`
   - `invoice_3_electronics.png`

## What It Measures

| Metric | Description |
|--------|-------------|
| Success Rate | % of successful API calls |
| Mean Latency | Average response time |
| Median (P50) | 50th percentile latency |
| P90/P95/P99 | Tail latency percentiles |
| Std Deviation | Latency variability |
| IQR | Interquartile range |

## Output

The profiler generates an interactive HTML report with:
- **Summary statistics** for each feature
- **Latency histograms** showing distribution
- **Box plots** visualizing quartiles and outliers
- **Timeline charts** showing latency over runs

**Report location:** `profiler/profiler-report.html`

## Latest Results

| Feature | Runs | Success | Mean | P50 | P95 |
|---------|------|---------|------|-----|-----|
| Auto-Categorization | 100 | 99% | 682ms | 596ms | 1103ms |
| Invoice Parsing | 20 | 100% | 2695ms | 1788ms | 6601ms |

## Files

| File | Description |
|------|-------------|
| `run-stats.ts` | Main profiler script |
| `profiler-report.html` | Generated HTML dashboard |
| `invoices/` | Sample invoice images for OCR testing |
| `scripts/` | Helper scripts for auth tokens |

## How It Works

1. **Auto-Categorization Test** (100 runs)
   - Randomly selects from 30 test transactions
   - Sends to OpenRouter API with 30 mock categories
   - Measures round-trip latency

2. **Invoice Parsing Test** (20 runs)
   - Randomly selects invoice images from `invoices/`
   - Encodes to base64 and sends to vision model
   - Measures parsing latency

## Configuration

Edit `run-stats.ts` to customize:
- Number of test runs
- Test transactions
- Mock categories
- Output format