import { orderService, OrderData } from '../lib/orderService';

async function testOrderFlow() {
  console.log('🧪 Testing Complete Order Flow...');
  
  try {
    // Test order creation
    const orderData: OrderData = {
      member_id: "69149187-94af-4892-b24c-f169bac1e825", // Use actual member UUID
      pizza_name: 'Margherita Pizza',
      pizza_price: 18.99,
      time_slot: '6:00 PM',
      date: '12/28/24',
      phone: '555-123-4567',
      special_instructions: 'Extra cheese please'
    };
    
    console.log('🍕 Creating test order:', orderData);
    
    const result = await orderService.createOrder(orderData);
    
    if (result.success && result.orderId) {
      console.log('✅ Order created successfully!');
      console.log('📱 SMS confirmation sent');
      console.log('🆔 Order ID:', result.orderId);
      
      // Test order retrieval
      console.log('🔍 Testing order retrieval...');
      const order = await orderService.getOrderById(result.orderId);
      
      if (order) {
        console.log('✅ Order retrieved successfully:', order);
        
        // Test status update
        console.log('🔄 Testing status update...');
        const statusUpdated = await orderService.updateOrderStatus(result.orderId, 'in_progress');
        
        if (statusUpdated) {
          console.log('✅ Order status updated successfully');
        } else {
          console.log('❌ Order status update failed');
        }
      } else {
        console.log('❌ Order retrieval failed');
      }
      
    } else {
      console.error('❌ Order creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Order flow test failed:', error);
  }
}

testOrderFlow();
