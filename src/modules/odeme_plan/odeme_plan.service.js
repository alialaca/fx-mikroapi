const OdemePlan = require('./odeme_plan.model')

class OdemePlanService {
    list(){
        return OdemePlan.list()
    }
}

module.exports = new OdemePlanService()
