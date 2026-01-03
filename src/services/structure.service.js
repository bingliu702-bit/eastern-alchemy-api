// src/services/structure.service.js

export function generateStructure(order) {
  const { full_name, birth_date, birth_time, birth_place } = order;

  return {
    user: {
      name: full_name,
      birth: {
        date: birth_date,
        time: birth_time,
        place: birth_place,
      },
    },
    destiny_focus: "Five-Element Balance",
    core_question: "What is your dominant element and current imbalance?",
  };
}
