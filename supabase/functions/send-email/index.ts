const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured in Supabase secrets.')
    }

    const { to, subject, type = 'welcome', payload = {} } = await req.json()

    if (!to) {
      return new Response(JSON.stringify({ error: 'Recipient email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const fromAddress = Deno.env.get('RESEND_FROM') || 'CulinaAI <onboarding@resend.dev>'
    let htmlContent = ''
    let emailSubject = subject || 'CulinaAI Culinary Update'

    if (type === 'welcome') {
      emailSubject = subject || 'Welcome to CulinaAI, Chef! 🍲'
      const chefName = payload.name || to.split('@')[0] || 'Chef'

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #24251F;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F3; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #FFFFFF; border-radius: 20px; border: 1px solid rgba(36, 37, 31, 0.08); overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
                  <!-- Brand Header -->
                  <tr>
                    <td style="padding: 36px 36px 20px 36px; border-bottom: 1px solid rgba(36, 37, 31, 0.06);">
                      <div style="display: flex; align-items: center;">
                        <span style="display: inline-block; width: 44px; height: 44px; background-color: #557A46; border-radius: 12px; text-align: center; line-height: 44px; font-size: 22px; color: #FAF8F3;">
                          🍳
                        </span>
                        <span style="font-size: 24px; font-weight: 800; margin-left: 14px; letter-spacing: -0.5px; color: #24251F;">
                          Culina<span style="color: #557A46;">AI</span>
                        </span>
                      </div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 36px;">
                      <h1 style="font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px; color: #24251F; letter-spacing: -0.3px;">
                        Welcome to your intelligent kitchen, ${chefName}!
                      </h1>
                      <p style="font-size: 15px; line-height: 1.6; color: #77796F; margin-top: 0; margin-bottom: 24px;">
                        We're thrilled to have you join CulinaAI. Your culinary journey just got effortlessly creative:
                      </p>

                      <!-- Feature Pillars -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F3; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
                        <tr>
                          <td>
                            <div style="margin-bottom: 16px;">
                              <strong style="color: #557A46; font-size: 14px;">✨ Natural Language Recipe Discovery</strong>
                              <p style="font-size: 13px; color: #24251F; margin: 4px 0 0 0; line-height: 1.5;">
                                Type what you crave in plain English — e.g. <em>"Comfort food under 30 mins with garlic and mushrooms"</em>.
                              </p>
                            </div>
                            <div style="margin-bottom: 16px;">
                              <strong style="color: #557A46; font-size: 14px;">🧑‍🍳 Conversational AI Sous Chef</strong>
                              <p style="font-size: 13px; color: #24251F; margin: 4px 0 0 0; line-height: 1.5;">
                                Tap the AI Chef in your navbar anytime for tailored recipes, substitution tips, and macro breakdowns.
                              </p>
                            </div>
                            <div>
                              <strong style="color: #557A46; font-size: 14px;">🛒 Smart Consolidated Grocery List</strong>
                              <p style="font-size: 13px; color: #24251F; margin: 4px 0 0 0; line-height: 1.5;">
                                Combine ingredients from multiple recipes into a single, de-duplicated shopping checklist grouped by aisle.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 13px; line-height: 1.5; color: #77796F; margin-bottom: 0;">
                        Bon appétit,<br>
                        <strong style="color: #24251F;">The CulinaAI Culinary Team</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 36px; background-color: #FAF8F3; border-top: 1px solid rgba(36, 37, 31, 0.06); text-align: center;">
                      <p style="font-size: 11px; color: #77796F; margin: 0;">
                        CulinaAI &bull; Think Ingredients. Discover Recipes.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    } else if (type === 'grocery_list' || type === 'grocery-list') {
      emailSubject = subject || 'Your CulinaAI Shopping List 🛒'
      const items = payload.items || []

      // Group items by aisle
      const grouped: Record<string, any[]> = {}
      for (const item of items) {
        const aisle = item.aisle || 'General Pantry'
        if (!grouped[aisle]) grouped[aisle] = []
        grouped[aisle].push(item)
      }

      let groupedRowsHtml = ''
      for (const [aisle, aisleItems] of Object.entries(grouped)) {
        const itemsList = aisleItems
          .map(
            (it) => `
          <tr style="border-bottom: 1px solid rgba(36, 37, 31, 0.05);">
            <td style="padding: 10px 12px; font-size: 14px; color: #24251F;">
              <span style="display: inline-block; width: 14px; height: 14px; border: 1.5px solid #557A46; border-radius: 4px; margin-right: 8px; vertical-align: middle;"></span>
              ${it.name}
            </td>
            <td align="right" style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #557A46;">
              ${it.amount} ${it.unit}
            </td>
          </tr>
        `
          )
          .join('')

        groupedRowsHtml += `
          <tr>
            <td colspan="2" style="padding: 14px 12px 6px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #77796F; background-color: #FAF8F3;">
              ${aisle}
            </td>
          </tr>
          ${itemsList}
        `
      }

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #24251F;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F3; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #FFFFFF; border-radius: 20px; border: 1px solid rgba(36, 37, 31, 0.08); overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
                  <tr>
                    <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid rgba(36, 37, 31, 0.06);">
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 20px; font-weight: 800; color: #24251F;">
                          Culina<span style="color: #557A46;">AI</span> Shopping List
                        </span>
                        <span style="font-size: 12px; font-weight: 600; background-color: #557A46; color: white; padding: 4px 10px; border-radius: 12px;">
                          ${items.length} Items
                        </span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 24px 36px;">
                      <p style="font-size: 14px; color: #77796F; margin-top: 0; margin-bottom: 20px;">
                        Here is your consolidated ingredient list ready for your grocery run:
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid rgba(36, 37, 31, 0.08); border-radius: 12px; overflow: hidden;">
                        ${groupedRowsHtml}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 20px 36px; background-color: #FAF8F3; border-top: 1px solid rgba(36, 37, 31, 0.06); text-align: center;">
                      <p style="font-size: 11px; color: #77796F; margin: 0;">
                        Exported from CulinaAI &bull; Think Ingredients. Discover Recipes.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    } else {
      // General culinary update
      htmlContent = `
        <div style="font-family: sans-serif; padding: 24px; color: #24251F;">
          <h2>${emailSubject}</h2>
          <p>${payload.message || 'Culinary update from CulinaAI.'}</p>
        </div>
      `
    }

    // Call Resend API
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: emailSubject,
        html: htmlContent,
      }),
    })

    const result = await resendRes.json()

    if (!resendRes.ok) {
      return new Response(JSON.stringify({ error: result }), {
        status: resendRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
