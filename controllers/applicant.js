/**
 * GET /applicant/exam
 * Renders the applicant exam page.
 */
exports.getExam = (req, res) => {
  res.render('applicant/exam', {
      title: 'Applicant Assessment'
  });
};

/**
 * GET /applicant/scores
 * Renders the applicant scores page.
 */
exports.getScores = (req, res) => {
  res.render('applicant/scores', {
      title: 'Applicant Assessment Scores'
  });
};

/**
 * GET /applicant/form
 * Renders the applicant score data entry page.
 */
exports.getForm = (req, res) => {
  res.render('applicant/form', {
      title: 'Assessment Score Data Entry Form'
  });
};
