exports.show = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/index', {
    actions: {
      back: '#',
      defer: `/trainees/${traineeId}/defer`,
      withdraw: `/trainees/${traineeId}/withdraw`
    }
  })
}
