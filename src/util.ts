const STATE = {
  counter: 0,
};

export const uniqueId = () => {
  STATE.counter = STATE.counter + 1;
  return STATE.counter;
};
