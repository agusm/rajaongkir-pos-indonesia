'use strict'
const Database = use('Database')

class PoController {
  async labelPosCode({
    request,
    response
  }) {
    const requestBody = {
      keyword: request.input('keyword')
    }
    const responseSOAP = await axios.post('http://www.posindonesia.co.id/wp-content/plugins/tarif-kiriman/source/kodepos.php', qs.stringify(requestBody), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    console.log(responseSOAP.data)

    response.json({
      "suggestions": responseSOAP.data
    })
  }
}

module.exports = PoController
