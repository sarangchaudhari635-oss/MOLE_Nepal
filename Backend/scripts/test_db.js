require('dotenv').config();
const { supabase } = require('../src/config/supabase');

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Seeded users in DB:', data);
  }
}

checkUsers();
