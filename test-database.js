// Quick test script to verify database connection and report model
// Run with: node test-database.js

const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://senmohit9005:8wxbZTl7zfnCwphs@iscrape.b9zta.mongodb.net/jeevveda';

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check if reports collection exists
    const hasReports = collections.find(col => col.name === 'reports');
    if (hasReports) {
      const Report = mongoose.connection.collection('reports');
      const count = await Report.countDocuments();
      console.log(`\n✅ Reports collection found with ${count} documents`);

      if (count > 0) {
        console.log('\n📄 Sample report:');
        const sample = await Report.findOne();
        console.log(JSON.stringify(sample, null, 2));
      }
    } else {
      console.log('\n⚠️  Reports collection not found yet.');
      console.log('   It will be created when you save your first report.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
