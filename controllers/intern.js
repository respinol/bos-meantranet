/**
 * GET /intern/consequence
 * Renders the consequence picker page.
 */
exports.getConsequence = (req, res) => {
  res.render('intern/consequence', {
      title: 'Consequence Picker'
  });
};
