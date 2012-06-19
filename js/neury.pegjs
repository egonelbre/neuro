start
  = lines:(line "\n")* last:line "\n"?
{
  var r = [];
  for(var i = 0; i < lines.length; i += 1)
    if(lines[i][0] != 0)
      r.push(lines[i][0]);
  if(last && (last != 0))
    r.push(last);
  return r;
}

line
  = assign:assignment comment? {return {typ:"wire", "def":assign};}
  / layout:layouting comment? {return {typ:"layout", "def":layout};}
  / comment? {return 0;}

comment
  = space "#" [^\n]*

assignment
  = output:nodes space "~" space input:nodes off:(space "+"? space float)?
{
   var off = off ? off[3] : 0.0;
   return {output: output, input: input, offset:off};
}

layouting
  = space "=" space nodes:nodes { return {nodes:nodes}; }

nodes
  = first:node rest:( space "+"? space node )*
{ 
   for(var i = 0; i < rest.length; i += 1){
     first = first.concat(rest[i][3]);
   }
   return first;
}

node
  = multiplier:float? (space "*" space)? nodes:range_node
{
  var r = [];
  if(!multiplier) multiplier = 1.0;
  for(var i = 0; i < nodes.length; i += 1){
    r.push({ name : nodes[i], multiplier: multiplier });
  }
  return r;
}

range_node
  = prefix:single_node rs:ranges
{
  var expand = function(prefixes, ranges){
    if(ranges.length <= 0)
      return prefixes;
    var result = [],
        range = ranges.shift();
    for(var i = 0; i < prefixes.length; i += 1){
      var prefix = prefixes[i];
      for(var k = 0; k < range.length; k += 1){
        result.push(prefix + "." + range[k]);
      }
    }
    return expand(result, ranges);
  }
  return expand([prefix], rs);
}

ranges
  = rs:range* { return rs }

range
  = "[" from:integer ".." to:integer "]" 
{
  var r = [];
  for(var i = from; i <= to; i += 1)
    r.push(i);
  return r;
}

single_node
  = identifier

identifier
  = start:[a-zA-Z] end:[a-zA-Z0-9\.]* {return start + end.join("");}

space
  = spaces:[ \t]* { return spaces.join(""); }


float "float"
  = sign:"-"? space main:digits decimal:("." digits)? 
{
  if(!decimal)
    decimal = [];
  return parseFloat(sign + main + decimal.join("")); 
}

digits
  = digits:[0-9]+ { return digits.join(""); }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }