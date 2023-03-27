const { OdemePlan } = require('../models')
class OdemePlanService {
    list(){
        return OdemePlan.list()
    }
}

module.exports = new OdemePlanService()
