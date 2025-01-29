
 // You can install 'node-fetch' if not already available

exports.handler = async function(event, context) {
    const API_URL = process.env.API_URL; // Your API URL (configured in Netlify environment settings)
    const API_KEY = process.env.API_KEY; // Your API Key (configured in Netlify environment settings)

   let promoCode;
    try {
        if (event.body) {
            const parsedBody = JSON.parse(event.body);
            promoCode = parsedBody.promoCode;
        } else {
            throw new Error('No promoCode in request body');
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: 'Invalid JSON or missing promoCode' }),
        };
    }

    try {
        // Call the external API (e.g., Supabase, etc.)
        const response = await fetch(`${API_URL}/rest/v1/promo_codes?promo_code=eq.${promoCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': `${API_KEY}`,
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const data = await response.json();

        if (data && data.length > 0) {
            // If promo code is valid
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, promoCode: data[0].promo_code }),
            };
        } else {
            // If promo code is invalid
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Invalid promo code' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Internal Server Error' }),
        };
    }
};
