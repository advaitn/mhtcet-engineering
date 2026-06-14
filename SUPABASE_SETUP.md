# Supabase Migration Guide

## Quick Setup (5 minutes)

1. **Go to https://supabase.com and sign in**
   - Use GitHub authentication for fastest setup

2. **Create a new project:**
   - Click "New Project"
   - Name: `mhtcet-engineering`
   - Database Password: (generate a strong one and save it)
   - Region: Choose closest to you (e.g., Southeast Asia)
   - Click "Create new project"

3. **Get your connection string:**
   - Once project is created, go to Settings > Database
   - Under "Connection string" section, select "URI" mode
   - Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Update the project:**
   - Replace DATABASE_URL in `/Users/advaitnandeshwar/Desktop/mhtcet-engineering/web/.env`
   - Run: `cd /Users/advaitnandeshwar/Desktop/mhtcet-engineering/web && npm run db:push`
   - Run: `npm run db:import`

## Why Supabase?
- Free tier: 500 MB database + 8 GB Postgres (vs Neon's 512 MB total)
- Better free tier limits
- All 1M+ rows will fit comfortably

## Alternative: Quick Web Setup
Visit: https://database.new
- This creates a Supabase project in one click!
- Then follow step 3 above to get the connection string
