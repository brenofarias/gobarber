import * as Yup from "yup";
import { startOfHour, parseISO, isBefore } from "date-fns";
import User from "../models/User";
import Appointment from "../models/Appointment";

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validação falhou" });
    }

    const { provider_id, date } = req.body;

    /**
     * Checando se o provider_id é um provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: "Você só pode criar compromissos com fornecedores" });
    }

    /**
     * Checando datas passadas
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: "Datas passadas não são permitidas" });
    }

    /**
     * Checando disponibilidade de data
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: "Data do compromisso não está disponível" });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
