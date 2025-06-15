const { faker } = require('@faker-js/faker');

const CODE_SUCCESS = 200;

module.exports = (app) => {
  app.post('/mock/user/login', (req, res) => {
    res.json({
      code: CODE_SUCCESS,
      data: {
        token: faker.string.uuid(),
      },
    });
  });

  app.get('/mock/user/info', (req, res) => {
    res.json({
      code: CODE_SUCCESS,
      data: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        description: faker.lorem.sentence(),
        created_at: faker.date.recent(),
        updated_at: faker.date.recent(),
        avatar: faker.image.avatar(),
        email: faker.internet.email(),
        roles: [faker.helpers.arrayElement(['admin', 'user'])],
        status: faker.helpers.arrayElement(['active', 'inactive']),
      },
    });
  });

  app.get('/mock/user/list', (req, res) => {
    res.json({
      code: CODE_SUCCESS,
      data: {
        list: Array.from({ length: 10 }, () => ({
          id: faker.number.int({ min: 1, max: 1000 }),
          name: faker.person.fullName(),
          description: faker.lorem.sentence(),
          created_at: faker.date.recent(),
          updated_at: faker.date.recent(),
          avatar: faker.image.avatar(),
          email: faker.internet.email(),
          roles: [faker.helpers.arrayElement(['admin', 'user'])],
          status: faker.helpers.arrayElement(['active', 'inactive']),
        })),
      },
    });
  });
};
