'use strict'

const Database = use('Database')

const Task = use('Task')
const axios = use('axios')
const _ = use('lodash');
var qs = use('querystring');

class PosCode extends Task {
  static get schedule() {
    return '*/5 * * * * *'
  }

  async handle() {
    const subdistrict = await Database
      .select(['subdistricts.id', 'subdistricts.name', 'districts.name as city', 'districts.postal_code'])
      .table('subdistricts')
      .join('districts', 'districts.id', 'subdistricts.district_id')
      .where('zip_code', '')
      .first()

    // console.log('data', subdistrict.id, subdistrict.name)

    const requestBody = {
      keyword: `${subdistrict.name}`
    }
    const responseSOAP = await axios.post('http://www.posindonesia.co.id/wp-content/plugins/tarif-kiriman/source/kodepos.php', qs.stringify(requestBody), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })

    const data = responseSOAP.data
    // console.log(data)

    const splitSubdistrict = subdistrict.name.replace(/ /g, '')
    // console.log('join', splitSubdistrict)

    const label = _.filter(data, (o) => {
      return ((new RegExp(subdistrict.name, 'i')).test(o.label) || (new RegExp(splitSubdistrict, 'i')).test(o.label)) && (new RegExp(subdistrict.city, 'i').test(o.category));
    })

    let status = ''
    if (label.length > 0) {
      const poscode = label[0].label.split('-').pop().trim()
      status = await Database.table('subdistricts').where('id', subdistrict.id).update('zip_code', poscode)
    } else {
      status = await Database.table('subdistricts').where('id', subdistrict.id).update('zip_code', subdistrict.postal_code)
    }

    console.log('status', status)

  }
}

module.exports = PosCode
