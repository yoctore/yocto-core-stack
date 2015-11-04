exports.fnA = function(req, res) {
  // to do fn A
  console.log('dans fn A');
  this.get('render').render(res, 'index', {});
};