const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { log } = require('console');


const BOT_TOKEN = "7633674228:AAHRxrHW18zMZVuLoinekSlUusb3iAKlx6Y";


router.post('/auth/telegram', async (req, res) => {
    try {
        const { 
            id, 
            first_name, 
            username, 
          
            auth_date, 
            hash 
        } = req.body;

        // Check if the auth date is not expired (86400 seconds = 24 hours)
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - auth_date > 86400) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication expired' 
            });
        }

        // Create a data check string
        const dataCheckArr = [];
        Object.keys(req.body)
            .filter(key => key !== 'hash')
            .sort()
            .forEach(key => {
                dataCheckArr.push(`${key}=${req.body[key]}`);
            });

        const dataCheckString = dataCheckArr.join('\n');

        // Create a secret key using SHA256
        const secretKey = crypto
            .createHash('sha256')
            .update(BOT_TOKEN)
            .digest();

        // Generate the hash using HMAC-SHA256
        const hmac = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Verify the hash
        if (hmac !== hash) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid authentication' 
            });
        }

      
        const userData = {
            telegramId: id,
            firstName: first_name,
            username: username,
           
            authDate: new Date(auth_date * 1000)
        };

        console.log(userData);
        

        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            user: userData,
            
            
        });

    } catch (error) {
        console.error('Telegram auth error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during authentication' 
        });
    }
});

router.get("/",(req,res)=>{
    res.json({"message":"sucess"});
})
module.exports = router;