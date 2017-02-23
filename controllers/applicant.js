/**
 * GET /applicant/exam
 * Renders the applicant exam page..
 */

exports.getExam = (req, res) => {
  res.render('applicant/exam', {
      title: 'Applicant Assessment'
  });
};
