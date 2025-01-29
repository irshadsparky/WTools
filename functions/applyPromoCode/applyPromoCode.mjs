
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
        const response = await fetch(`${API_URL}/rest/v1/promo_codes?actual_promo_code=eq.${promoCode}&used=eq.FALSE&select=*&limit=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': `${API_KEY}`,
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const data = await response.json();

         if (data && data.length > 0) {
            // Promo code is valid and unused, proceed to mark it as used
            const actualPromoCode = data[0].promo_code;

            console.log('Promo code is valid:', actualPromoCode);

            // Step 2: Mark the promo code as used
            const updateData = { used: true };

            const markUsedResponse = await fetch(`${API_URL}/rest/v1/promo_codes?promo_code=eq.${actualPromoCode}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify(updateData),
            });

            if (markUsedResponse.ok) {
                console.log(`Promo code ${actualPromoCode} marked as used.`);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true, promoCode: actualPromoCode }),
                };
            } else {
                console.error('Failed to mark promo code as used.');
                return {
                    statusCode: 400,
                    body: JSON.stringify({ success: false, message: 'Failed to mark promo code as used.' }),
                };
            }
        } else {
            // Promo code is invalid or already used
            console.log('Promo code is invalid or already used');
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Promo code is invalid or has already been used.' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Internal Server Error' }),
        };
    }
};
