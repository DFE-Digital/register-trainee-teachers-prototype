exports.show = async (req, res) => {
  delete req.session.data.withdrawal
  delete req.session.data.referrer

  const { traineeId } = req.params

  res.render('trainees/index', {
    actions: {
      back: '#',
      defer: `/trainees/${traineeId}/defer`,
      withdraw: `/trainees/${traineeId}/withdraw`
    }
  })
}
