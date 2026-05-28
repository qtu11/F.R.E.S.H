const postgres = require('postgres');

async function clean() {
  const projectRef = 'ktnhoiqqecygxztsugkx';
  const password = encodeURIComponent('motminhcungonma');
  const connStr = `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`;
  const sql = postgres(connStr);
  try {
    // Tìm các sản phẩm có ID bắt đầu bằng 'p' (không phải 'rp')
    const trashProducts = await sql`SELECT id, name FROM products WHERE id LIKE 'p%' AND id NOT LIKE 'rp%'`;
    console.log(`Found ${trashProducts.length} trash products starting with 'p' (non-rp):`);
    console.log(trashProducts.map(p => `${p.id}: ${p.name}`).join('\n'));

    if (trashProducts.length > 0) {
      console.log('Deleting trash products...');
      // Xóa trong bảng favorites trước để tránh lỗi khóa ngoại nếu có
      const trashIds = trashProducts.map(p => p.id);
      const favDelete = await sql`DELETE FROM favorites WHERE product_id IN (${trashIds})`;
      console.log(`Deleted ${favDelete.count} favorites records`);

      // Xóa trong bảng products
      const prodDelete = await sql`DELETE FROM products WHERE id IN (${trashIds})`;
      console.log(`Deleted ${prodDelete.count} products records`);
    } else {
      console.log('No trash products to delete.');
    }
  } catch (err) {
    console.error('Operation failed:', err);
  } finally {
    await sql.end();
  }
}

clean();
