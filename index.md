---
layout: default
title: Neuro
subtitle: Blah
---

### Who needs this?
This is designed for learning and studying neural networks, and easy modification of them.

### How does the simulator work?
The `Net` simulator is based on three concepts `Node`, `Port` and `Wire`.

* `Node` : is where the computation happens. It collects input from the input `Port` and calculates a new value for the output `Port`.
* `Port` : is just for managing `Wires` (for input and output), also if it's for output it also stores the value for `Node`.
* `Wire` : just connects two ports and signals the `to.Port`, if the `from.Port` changes.

`Net` state is updated in two steps. First is the computation phase and the second is the update/signal phase. In the computation phase node gets the data from the input port, which collects from all the incoming wires. Then a new value is computed in the `Node` and stored there.

In the update/signal phase the `Node` puts the value to the output `Port`. If the output `Port` value changes it sends a signal through each outgoing `Wire` to the connected `Nodes`. These `Nodes` will schedule themselves in the `CPU` for the next cycle of computation. This scheduling helps to avoid unnecessary calculations (nodes where the input did not change).

### How does the GUI work?

Uses the hud idea.
