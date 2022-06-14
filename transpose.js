$(document).ready(function() {

if ($("body #transpose").length) {
  $("body #transpose").remove();
  return
}

$(`<div id="transpose"><style type="text/css">
#transpose ~ .x-window {
  height: 724px!important;
}

#transpose ~ .x-window .x-window-body,
#transpose ~ .x-window .x-window-body > .x-box-inner {
  height: 661px!important;
}

#transpose ~ .x-window > .x-toolbar {
  top: 690px!important;
}

.rubric-table {
  transform-origin: 0 0;
  transform: scale(0.7) rotate(-90deg) translateX(-100%);
}

.rubric-readonly-table {
  transform-origin: 0 0;
  transform: scale(0.9) rotate(-90deg) translateX(-100%);
}

.rubric-table * {
  font-size: calc(10px / 0.7)!important;
}

.rubric-readonly-table * {
  font-size: calc(10px / 0.9)!important;
}

.rubric-table {
  height: calc(980px / 0.7)!important;
  width: calc(616px / 0.7)!important;
}

.rubric-readonly-table {
  height: 804px!important;
}

.rubric-readonly-table .x-panel-body,
.rubric-readonly-table .x-panel-body .x-grid-view {
  width: inherit!important;
  height: 783px!important;
}

.rubric-table .x-panel-body,
.rubric-table .x-panel-body .x-grid-view {
  height: calc(939px / 0.7)!important;
}

.rubric-readonly-table .x-panel-body .x-grid-view table td,
.rubric-table .x-panel-body .x-grid-view table td {
  height: 120px;
  vertical-align: unset!important;
}

.rubric-readonly-table .x-panel-body .x-grid-view table td > div,
.rubric-table .x-panel-body .x-grid-view table td > div {
  transform-origin: 0 0;
  transform: rotate(90deg) translateY(-100%);
  overflow: unset;
  width: 110px;
}

.rubric-readonly-table .x-panel-body .x-grid-view table td > div *,
.rubric-table .x-panel-body .x-grid-view table td > div * {
  width: inherit;
  height: inherit;
}

.allocated-grading-scale-cell-content {
  padding-bottom: 0px;
}

.allocated-grading-scale-cell-content li:last-child {
  margin-bottom: 0px;
  padding-bottom: 0px;
}

.rubric-table .x-docked-right {
  width: 30px!important;
  height: calc(956px / 0.7)!important;
}

.rubric-table .x-docked-right * {
  overflow: unset;
}

.rubric-table .x-docked-right a {
  top: calc(860px / 0.7 / 2)!important;
  transform-origin: 0 0;
  transform: rotate(90deg) translateY(-100%);
}

.rubric-table .x-docked-bottom {
  width: calc(590px / 0.7)!important;
  top: calc(960px / 0.7)!important;
}

.rubric-table .x-docked-bottom a {
  left: calc(480px / 0.7 / 2)!important;
}
</style></div>`).appendTo("body");

});