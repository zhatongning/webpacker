module.exports = function(content, options) {
  const specialRegExp = /([\w|\s]+\s+=\s+)\(\)\s+==>\s+\{([\s|\n|.|\w|\(|\)|\`|\'|\"]+)\}/
  const result = specialRegExp.exec(content)
  let newContent = ""
  if (result) {
    newContent = `${result[1]}function() {${result[2]}}`
  }
  // return newContent || content
  this.callback(null, newContent)
}
