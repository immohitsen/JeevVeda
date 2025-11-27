# How to View Your Reports in MongoDB Atlas

## ✅ Database Configuration

I've updated your MongoDB connection to use database name: **`jeevveda`**

**Connection String**: `mongodb+srv://senmohit9005:8wxbZTl7zfnCwphs@iscrape.b9zta.mongodb.net/jeevveda`

---

## 📊 How to View Data in MongoDB Atlas

### Method 1: MongoDB Atlas Dashboard (Recommended)

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** with your credentials
3. **Select your cluster**: `iscrape`
4. **Click "Browse Collections"** button
5. **Select Database**: `jeevveda`
6. **You will see these collections**:
   - `patientdatas` - User accounts
   - `reports` - All medical reports (NEW!)

### Method 2: Using MongoDB Compass (Desktop App)

1. **Download MongoDB Compass**: https://www.mongodb.com/try/download/compass
2. **Open Compass**
3. **Paste connection string**:
   ```
   mongodb+srv://senmohit9005:8wxbZTl7zfnCwphs@iscrape.b9zta.mongodb.net/jeevveda
   ```
4. **Click Connect**
5. **Browse Collections**: Navigate to `jeevveda` → `reports`

---

## 🔍 What You'll See in the `reports` Collection

Each report document will look like this:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "abc123xyz",
  "reportType": "BLOOD_ANALYSIS",
  "fileName": "blood-test.pdf",
  "fileSize": 256789,
  "reportData": {
    "testResults": [...],
    "cancerRiskAssessment": {...},
    "insights": [...]
  },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## 🧪 How to Test and See Data

### Step 1: Restart Your Development Server

Since we updated the `.env` file, you need to restart:

```bash
# Stop current server (Ctrl+C)
# Then start again
npm run dev
```

### Step 2: Generate Some Reports

1. **Upload a blood report** in Blood Analyzer
2. **Upload an MRI scan** in MRI Analysis
3. **Complete a risk assessment** in Chatbot

### Step 3: Check Console Logs

You should see messages like:
```
Blood report saved: 507f1f77bcf86cd799439011
MRI report saved: 507f1f77bcf86cd799439012
Risk assessment report saved: 507f1f77bcf86cd799439013
```

### Step 4: View in MongoDB Atlas

1. Go to MongoDB Atlas
2. Browse Collections → `jeevveda` → `reports`
3. You'll see all the saved reports!

---

## 📋 Collections Structure

```
Database: jeevveda
├── patientdatas (existing)
│   ├── User 1
│   ├── User 2
│   └── ...
│
└── reports (NEW!)
    ├── Blood Analysis Reports
    ├── MRI Scan Reports
    └── Risk Assessment Reports
```

---

## 🔗 Quick Access Links

- **MongoDB Atlas Dashboard**: https://cloud.mongodb.com/
- **Cluster**: `iscrape`
- **Database**: `jeevveda`
- **Collections**: `reports`, `patientdatas`

---

## ✅ Verification Checklist

- [ ] Restart development server after `.env` change
- [ ] Perform at least one analysis (Blood/MRI/Risk)
- [ ] Check console for "Report saved" message
- [ ] Login to MongoDB Atlas
- [ ] Navigate to `jeevveda` database
- [ ] Open `reports` collection
- [ ] See your saved reports!

---

## 🐛 Troubleshooting

**If you don't see the `reports` collection:**
- Make sure you restarted the dev server
- Perform at least one analysis to create the first report
- MongoDB only creates the collection after the first document is inserted
- Check console logs for any errors

**If you can't connect to MongoDB:**
- Verify your internet connection
- Check if MongoDB Atlas credentials are correct
- Whitelist your IP address in MongoDB Atlas (Network Access)

---

## 📊 Sample Queries (Atlas UI)

### Get all Blood Analysis reports:
```json
{ "reportType": "BLOOD_ANALYSIS" }
```

### Get reports from last 7 days:
```json
{
  "createdAt": {
    "$gte": { "$date": "2025-01-08T00:00:00.000Z" }
  }
}
```

### Get reports for specific user:
```json
{ "userId": "your-user-id-here" }
```

---

**That's it! Your reports are now being saved to MongoDB and you can view them anytime in MongoDB Atlas.** 🎉
