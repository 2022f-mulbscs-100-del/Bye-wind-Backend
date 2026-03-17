const { z } = require('zod');

const goLiveActionSchema = {
  params: z.object({
    restaurantId: z.string().uuid(),
  }),
};

module.exports = { goLiveActionSchema };
