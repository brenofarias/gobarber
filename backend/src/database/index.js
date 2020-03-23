import Sequelize from "sequelize";

import User from "../app/models/User";
import File from "../app/models/File";
import Appointment from "../app/models/Appointment";

import databaseConfig from "../config/database";

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models)); // INFORMA A CONEXÃO PARA O MÉTODO STATIC DO MODEL
  }
}

export default new Database();
