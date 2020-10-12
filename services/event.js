export const handleEvents = params => {
  const { type, ...data } = params;
  switch (type) {
  }
  return {
    code: 200,
    data: {
      message: 'Signal received'
    }
  }
}