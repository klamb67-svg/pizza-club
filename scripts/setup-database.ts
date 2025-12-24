import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createMissingTables() {
  console.log('🔧 Creating missing database tables...');
  
  try {
    // Create pizzas table
    console.log('🍕 Creating pizzas table...');
    const pizzasSQL = `
      CREATE TABLE IF NOT EXISTS pizzas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        available BOOLEAN DEFAULT true,
        category VARCHAR(50) DEFAULT 'classic',
        ingredients TEXT[],
        size_options VARCHAR(20)[],
        is_featured BOOLEAN DEFAULT false,
        preparation_time INTEGER DEFAULT 15,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: pizzasError } = await supabase.rpc('exec', { sql: pizzasSQL });
    if (pizzasError) {
      console.log('⚠️ Pizzas table warning:', pizzasError.message);
    } else {
      console.log('✅ Pizzas table created');
    }
    
    // Create nights table
    console.log('🌙 Creating nights table...');
    const nightsSQL = `
      CREATE TABLE IF NOT EXISTS nights (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Friday', 'Saturday')),
        is_active BOOLEAN DEFAULT true,
        max_capacity INTEGER DEFAULT 20,
        current_bookings INTEGER DEFAULT 0,
        start_time TIME DEFAULT '17:00',
        end_time TIME DEFAULT '20:00',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: nightsError } = await supabase.rpc('exec', { sql: nightsSQL });
    if (nightsError) {
      console.log('⚠️ Nights table warning:', nightsError.message);
    } else {
      console.log('✅ Nights table created');
    }
    
    // Create time_slots table
    console.log('⏰ Creating time_slots table...');
    const timeSlotsSQL = `
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        night_id INTEGER REFERENCES nights(id),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        max_orders INTEGER DEFAULT 1,
        current_orders INTEGER DEFAULT 0,
        assigned_member_id INTEGER REFERENCES members(id),
        order_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: timeSlotsError } = await supabase.rpc('exec', { sql: timeSlotsSQL });
    if (timeSlotsError) {
      console.log('⚠️ Time slots table warning:', timeSlotsError.message);
    } else {
      console.log('✅ Time slots table created');
    }
    
    // Create orders table
    console.log('📋 Creating orders table...');
    const ordersSQL = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id),
        pizza_id INTEGER REFERENCES pizzas(id),
        time_slot_id INTEGER REFERENCES time_slots(id),
        night_id INTEGER REFERENCES nights(id),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        quantity INTEGER DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        special_instructions TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: ordersError } = await supabase.rpc('exec', { sql: ordersSQL });
    if (ordersError) {
      console.log('⚠️ Orders table warning:', ordersError.message);
    } else {
      console.log('✅ Orders table created');
    }
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Insert sample pizzas
    const samplePizzas = [
      {
        name: 'Margherita',
        description: 'Classic tomato, mozzarella, and basil',
        price: 18.99,
        category: 'classic',
        ingredients: ['tomato sauce', 'mozzarella', 'basil'],
        size_options: ['small', 'medium', 'large'],
        is_featured: true,
        preparation_time: 15
      },
      {
        name: 'Pepperoni',
        description: 'Spicy pepperoni with mozzarella',
        price: 19.99,
        category: 'classic',
        ingredients: ['tomato sauce', 'mozzarella', 'pepperoni'],
        size_options: ['small', 'medium', 'large'],
        is_featured: true,
        preparation_time: 15
      },
      {
        name: 'Hawaiian',
        description: 'Ham, pineapple, and mozzarella',
        price: 21.99,
        category: 'specialty',
        ingredients: ['tomato sauce', 'mozzarella', 'ham', 'pineapple'],
        size_options: ['small', 'medium', 'large'],
        is_featured: false,
        preparation_time: 18
      }
    ];
    
    const { error: insertPizzasError } = await supabase
      .from('pizzas')
      .insert(samplePizzas);
    
    if (insertPizzasError) {
      console.log('⚠️ Sample pizzas warning:', insertPizzasError.message);
    } else {
      console.log('✅ Sample pizzas inserted');
    }
    
    // Insert sample night
    const sampleNight = {
      date: '2024-12-28',
      day_of_week: 'Saturday',
      is_active: true,
      max_capacity: 20,
      current_bookings: 0,
      start_time: '17:00',
      end_time: '20:00',
      notes: 'Pizza Dojo Saturday Night'
    };
    
    const { data: nightData, error: insertNightError } = await supabase
      .from('nights')
      .insert([sampleNight])
      .select()
      .single();
    
    if (insertNightError) {
      console.log('⚠️ Sample night warning:', insertNightError.message);
    } else {
      console.log('✅ Sample night inserted:', nightData.id);
      
      // Insert sample time slots
      const timeSlots = [
        { night_id: nightData.id, start_time: '17:15', end_time: '17:30', max_orders: 1 },
        { night_id: nightData.id, start_time: '17:30', end_time: '17:45', max_orders: 1 },
        { night_id: nightData.id, start_time: '17:45', end_time: '18:00', max_orders: 1 },
        { night_id: nightData.id, start_time: '18:00', end_time: '18:15', max_orders: 1 },
        { night_id: nightData.id, start_time: '18:15', end_time: '18:30', max_orders: 1 },
        { night_id: nightData.id, start_time: '18:30', end_time: '18:45', max_orders: 1 },
        { night_id: nightData.id, start_time: '18:45', end_time: '19:00', max_orders: 1 },
        { night_id: nightData.id, start_time: '19:00', end_time: '19:15', max_orders: 1 },
        { night_id: nightData.id, start_time: '19:15', end_time: '19:30', max_orders: 1 },
        { night_id: nightData.id, start_time: '19:30', end_time: '19:45', max_orders: 1 }
      ];
      
      const { error: insertTimeSlotsError } = await supabase
        .from('time_slots')
        .insert(timeSlots);
      
      if (insertTimeSlotsError) {
        console.log('⚠️ Sample time slots warning:', insertTimeSlotsError.message);
      } else {
        console.log('✅ Sample time slots inserted');
      }
    }
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

createMissingTables();

























