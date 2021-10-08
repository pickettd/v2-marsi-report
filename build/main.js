webpackJsonp([0],{

/***/ 133:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InspectionListPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__inspectioncreator_inspectioncreator__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__reportlist_reportlist__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__superdata_superdata__ = __webpack_require__(410);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_auth_service__ = __webpack_require__(28);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







;
var InspectionListPage = (function () {
    function InspectionListPage(navCtrl, dataProvider, auth, loadingCtrl) {
        this.navCtrl = navCtrl;
        this.dataProvider = dataProvider;
        this.auth = auth;
        this.loadingCtrl = loadingCtrl;
        this.resetData();
        this.doughnutChartSettings = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "75",
                aspectRatio: 1
            }
        };
    }
    InspectionListPage.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        this.loading.present();
        this.dataProvider.initDB(this.auth.currentUser.username, this.auth.currentUser.credential)
            .then(function () {
            console.time('calculateAllUnitsData-all');
            console.info('calling calc all unit data');
            var getAllUnitsProm = _this.dataProvider.getAllUnits(_this.auth.currentUser.username);
            getAllUnitsProm.then(function () {
                var reportsPromise = _this.dataProvider.getAllReportsByUnit();
                var visitByUnitsProm = _this.dataProvider.getAllVisitsByUnit();
                var tempProm = _this.dataProvider.getTemplateById(_this.dataProvider.templateChoices[0]._id);
                Promise.all([reportsPromise, visitByUnitsProm, tempProm]).then(function (responses) {
                    var reportsByUnit = responses[0];
                    var visitByUnits = responses[1];
                    _this.generateData(visitByUnits, reportsByUnit, _this.dataProvider.allUnits.data);
                    console.timeEnd('calculateAllUnitsData-all');
                    _this.loading.dismiss();
                });
            });
            _this.dataProvider.getAllInspectionIDs()
                .then(function (allInspectionsIDs) {
                _this.allInspectionIDs = allInspectionsIDs;
            });
        });
    };
    ;
    InspectionListPage.prototype.resetData = function () {
        this.dataByTemplate = {};
        this.dataByRoom = {};
        this.dataByIssueType = {};
        this.allInspectionIDs = {};
        this.accountOverallIssueTypeCounts = {};
        this.accountOverallItemsInspected = 0;
        this.accountSortedRoomScores = [];
        this.accountZenSortedArrays = { counts: [], percents: [] };
        this.accountFlagCategoriesSortedCounts = [];
        this.flagCategoryIndices = {};
        this.accountUnitsSortedByRevenue = [];
        this.accountTotalFlags = 0;
        this.accountSortedUnitScores = [];
        this.potentialRevenue = 0;
        this.projectsWorthStarting = 0;
        this.mostRecentActivities = {};
        this.accountScoreCategories = {
            Luxury: 0,
            Deluxe: 0,
            Standard: 0,
            Budget: 0,
            NA: 0
        };
        this.accountOverallScoreSum = 0;
    };
    /**
     * Once promises from the init are resolved generateData() takes over.
     * @param unitVisitData Result from the reportsPromise.
     * @param reportsByUnit Result from the visitByUnitsProm.
     * @param allUnits Result from the allUnitsProm
     */
    InspectionListPage.prototype.generateData = function (unitVisitData, reportsByUnit, allUnits) {
        var _this = this;
        console.info('Generating Data');
        console.info('unitVisitData', unitVisitData);
        console.info('allUnits', allUnits);
        console.info('reportsByUnit', reportsByUnit);
        this.resetData();
        Object.keys(reportsByUnit).forEach(function (key) {
            _this.generateReportRelatedData(reportsByUnit[key], key);
        });
        this.initTemplates();
        this.initDataByRoom();
        this.initDataByIssueType();
        this.initItemCategories(unitVisitData);
        for (var _i = 0, allUnits_1 = allUnits; _i < allUnits_1.length; _i++) {
            var unit = allUnits_1[_i];
            var templateType = unit.unitTemplate.displayName;
            var unitName = unit.name;
            var unitID = unit._id;
            var visitData = {};
            // First thing we'll do is use setupRoomStructure to setup the per-unit datastructures
            //------------------------------------------------------------------------------------
            if (unitVisitData[unit._id] && unitVisitData[unit._id].data) {
                visitData = unitVisitData[unit._id].data;
            }
            // Note that if we don't have visit data we just pass an empty object
            // to initialize the structures for that unit
            this.dataProvider.setupRoomStructure(unit._id, visitData);
            //------------------------------------------------------------------------------------
            // Here do the processing that uses the dataByUnit structure
            if (this.dataProvider.dataByUnit[unitID]) {
                this.accountOverallItemsInspected += this.dataProvider.dataByUnit[unitID].inspectedCount;
                var thisUnitScore = 0;
                if (this.dataProvider.dataByUnit[unitID].score) {
                    thisUnitScore = this.dataProvider.dataByUnit[unitID].score;
                    this.dataByTemplate[templateType].scores.push({ name: unitName, score: thisUnitScore, count: -1, sum: -1 });
                    this.accountSortedUnitScores.push({ name: unitName, score: thisUnitScore, count: -1, sum: -1 });
                }
                this.accountOverallScoreSum += thisUnitScore;
                this.dataByTemplate[templateType].overallSum += thisUnitScore;
                // They will increment NA if we don't have a score
                this.incrementScoreCategory(this.accountScoreCategories, thisUnitScore);
                this.incrementScoreCategory(this.dataByTemplate[unit.unitTemplate.displayName].scoreCategories, thisUnitScore);
                if (this.dataProvider.dataByUnit[unitID].potentialRevenue) {
                    this.accountUnitsSortedByRevenue.push({ unit: unit.name, potentialRevenue: this.dataProvider.dataByUnit[unitID].potentialRevenue });
                }
                if (this.dataProvider.dataByUnit[unitID].lastVisitID) {
                    var lastVisitID = this.dataProvider.dataByUnit[unitID].lastVisitID;
                    var timestamp = +lastVisitID.slice(lastVisitID.lastIndexOf(' ') + 1, lastVisitID.length);
                    this.updateRecentActivity(unitID, timestamp);
                }
                /**
                * Create issue category data here...
                * Add Zen to zen data...
                */
                if (this.dataProvider.dataByUnit[unitID].byUnitIssueStructure && this.dataProvider.dataByUnit[unitID].byUnitIssueStructure._keys) {
                    for (var _a = 0, _b = this.dataProvider.dataByUnit[unitID].byUnitIssueStructure._keys; _a < _b.length; _a++) {
                        var issueType = _b[_a];
                        // If the issueType hasn't been created yet, initialize it
                        if (!this.accountOverallIssueTypeCounts[issueType]) {
                            this.accountOverallIssueTypeCounts[issueType] = 0;
                        }
                        // If the count exists in the per-unit data, increment the overall count for that issue type by that count
                        if (this.dataProvider.dataByUnit[unitID].byUnitIssueStructure[issueType]) {
                            this.accountOverallIssueTypeCounts[issueType] += this.dataProvider.dataByUnit[unitID].byUnitIssueStructure[issueType].count;
                            // We can come back to dataByIssueType
                            //this.dataByIssueType[issueType].overallCount += this.dataProvider.dataByUnit[unitID].byUnitIssueStructure[issueType].count;
                            //this.dataByIssueType[issueType].scores
                            // For superdata we just need zen numbers sorted
                            if ((issueType === 'Zen') && (this.dataProvider.dataByUnit[unitID].byUnitIssueStructure[issueType].count)) {
                                this.accountZenSortedArrays.counts.push({ unitName: unit.name, zenCount: this.dataProvider.dataByUnit[unitID].byUnitIssueStructure[issueType].count });
                                this.accountZenSortedArrays.percents.push({ unitName: unit.name, zenPercent: (this.dataProvider.dataByUnit[unitID].byUnitIssueStructure[issueType].count / this.dataProvider.dataByUnit[unitID].byUnitIssueStructure._itemsInspectedCount) });
                            }
                        }
                    }
                }
                if (this.dataProvider.dataByUnit[unitID].roomScores) {
                    for (var _c = 0, _d = this.dataProvider.dataByUnit[unitID].roomScores; _c < _d.length; _c++) {
                        var roomScore = _d[_c];
                        if (roomScore.score !== 0) {
                            this.dataByRoom[roomScore.name].overallCount++;
                            this.dataByRoom[roomScore.name].overallSum += roomScore.score;
                            this.dataByRoom[roomScore.name].scores.push({ name: unit.name, score: roomScore.score, count: -1, sum: -1 });
                            this.accountSortedRoomScores.push({ unitName: unit.name, roomName: roomScore.name, score: roomScore.score });
                        }
                    }
                }
                /**
                * Create accountTotalFlags and flaggedItemCategories data here...
                */
                if (this.dataProvider.dataByUnit[unitID].byUnitIssueStructure && this.dataProvider.dataByUnit[unitID].byUnitIssueStructure._flagsList) {
                    this.accountTotalFlags += this.dataProvider.dataByUnit[unitID].byUnitIssueStructure._flagsList.length;
                    for (var _e = 0, _f = this.dataProvider.dataByUnit[unitID].byUnitIssueStructure._flagsList; _e < _f.length; _e++) {
                        var flag = _f[_e];
                        var category = flag.split('|')[1];
                        this.accountFlagCategoriesSortedCounts[this.flagCategoryIndices[category]].count++;
                    }
                }
            }
            this.dataByTemplate[templateType].overallCount++;
        }
        // Sort all the scores of the units in the account
        this.accountSortedUnitScores.sort(function (a, b) { return b.score - a.score; });
        // Sort all the rooms in the whole account
        this.accountSortedRoomScores.sort(function (a, b) { return b.score - a.score; });
        // Sort all the units by zen counts
        this.accountZenSortedArrays.counts.sort(function (a, b) { return b.zenCount - a.zenCount; });
        // Sort all the units by zen percents
        this.accountZenSortedArrays.percents.sort(function (a, b) { return b.zenPercent - a.zenPercent; });
        // Sort all the flag category counts
        this.accountFlagCategoriesSortedCounts.sort(function (a, b) { return b.count - a.count; });
        // Sort all the units by revenue
        this.accountUnitsSortedByRevenue.sort(function (a, b) { return b.potentialRevenue - a.potentialRevenue; });
        // For each template, sort the scores in that template
        for (var _g = 0, _h = this.dataProvider.templateChoices; _g < _h.length; _g++) {
            var template = _h[_g];
            var templateType = template.displayName;
            if (this.dataByTemplate[templateType] && this.dataByTemplate[templateType].scores) {
                this.dataByTemplate[templateType].scores.sort(function (a, b) { return b.score - a.score; });
            }
        }
        // Then for each room, sort the scores inside each
        for (var _j = 0, _k = this.dataProvider.defaultRoomOrder; _j < _k.length; _j++) {
            var roomName = _k[_j];
            if (this.dataByRoom[roomName] && this.dataByRoom[roomName].scores) {
                this.dataByRoom[roomName].scores.sort(function (a, b) { return b.score - a.score; });
            }
        }
        // console.info()
    };
    /**
     * Loop over the templateChoices in data.ts.
     */
    InspectionListPage.prototype.initTemplates = function () {
        var _this = this;
        this.dataProvider.templateChoices.forEach(function (template) {
            var nameOfTemplate = template.displayName;
            _this.initDataByTemplate(nameOfTemplate);
        });
    };
    /**
     * Creates a object on dataByTemplate.
     * @param nameOfTemplate Name of the template being created to use as the key.
     */
    InspectionListPage.prototype.initDataByTemplate = function (nameOfTemplate) {
        this.dataByTemplate[nameOfTemplate] = {
            overallCount: 0,
            scoreCategories: {
                Luxury: 0,
                Deluxe: 0,
                Standard: 0,
                Budget: 0,
                NA: 0
            },
            scores: [],
            overallScore: 0,
            overallSum: 0
        };
    };
    /**
     * Create data using a unit report.
     * @param unitReport The report of the unit being used to add data to the pool.
     * @param unitID The ID of the unit for updateRecentActivity()
     */
    InspectionListPage.prototype.generateReportRelatedData = function (unitReport, unitID) {
        // console.info(unitReport, unitName);
        if (!unitReport) {
            return;
        }
        if (unitReport.projObjDict) {
            this.projectsWorthStarting += Object.keys(unitReport.projObjDict).length;
        }
        if (unitReport.potentialRevenue) {
            this.potentialRevenue += unitReport.potentialRevenue;
        }
        if (unitReport._id) {
            var reportID = unitReport._id;
            this.updateRecentActivity(unitID, +reportID.slice(reportID.lastIndexOf(' ') + 1, reportID.length));
        }
    };
    /**
     * Update the mostRecentActivities object that's keyed by unit name.
     * @param unitName Name of the unit being updated.
     * @param newTimeStamp The possible new timestamp.
     */
    InspectionListPage.prototype.updateRecentActivity = function (unitName, newTimeStamp) {
        // console.info(unitName, newTimeStamp)
        if (!this.mostRecentActivities[unitName]) {
            this.mostRecentActivities[unitName] = newTimeStamp;
        }
        else if (this.mostRecentActivities[unitName] < newTimeStamp) {
            this.mostRecentActivities[unitName] = newTimeStamp;
        }
    };
    /**
     * Updates any scoreCategories.
     * @param scoreCategories The score category that will be updated.
     * @param score The score being used to update the data.
     */
    InspectionListPage.prototype.incrementScoreCategory = function (scoreCategories, score) {
        // console.info(scoreCategories, score);
        if (score >= 9) {
            scoreCategories.Luxury++;
        }
        else if (score >= 7) {
            scoreCategories.Deluxe++;
        }
        else if (score >= 5) {
            scoreCategories.Standard++;
        }
        else if ((score <= 4) && (score > 0)) {
            scoreCategories.Budget++;
        }
        else {
            scoreCategories.NA++;
        }
    };
    /**
     * Init dataByRoom.
     */
    InspectionListPage.prototype.initDataByRoom = function () {
        for (var _i = 0, _a = this.dataProvider.defaultRoomOrder; _i < _a.length; _i++) {
            var roomName = _a[_i];
            this.dataByRoom[roomName] = {
                overallCount: 0,
                scoreCategories: null,
                scores: [],
                overallScore: -1,
                overallSum: 0
            };
        }
    };
    /**
     * Init dataByIssueType
     */
    InspectionListPage.prototype.initDataByIssueType = function () {
        for (var _i = 0, _a = this.dataProvider.templateStructure.timelineKeys; _i < _a.length; _i++) {
            var typeName = _a[_i];
            this.dataByIssueType[typeName] = {
                overallCount: 0,
                scoreCategories: null,
                scores: [],
                overallScore: -1,
                overallSum: 0
            };
        }
    };
    /**
     * Creates the flaggedItemCategories base and indicesOfItemCategories for tracking.
     * Also setup the issue types for overall account
     * @param unitVisitData Uses the unitVisitData from getAllVisitsByUnit()
     */
    InspectionListPage.prototype.initItemCategories = function (unitVisitData) {
        if (this.dataProvider.inspectionTemplate) {
            if (this.dataProvider.inspectionTemplate.trades) {
                var tradeKeys = Object.keys(this.dataProvider.inspectionTemplate.trades);
                for (var i = 0; i < tradeKeys.length; i++) {
                    var category = tradeKeys[i];
                    this.accountFlagCategoriesSortedCounts.push({ category: category, count: 0 });
                    this.flagCategoryIndices[category] = i;
                }
            }
        }
    };
    InspectionListPage.prototype.showInspectionCreatorPage = function (unit) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__inspectioncreator_inspectioncreator__["a" /* InspectionCreatorPage */], { unit: unit }, { animate: true, direction: 'forward' });
    };
    InspectionListPage.prototype.showReportListPage = function (unit) {
        // Hack to make sure report list doesn't try to immediately render
        delete this.dataProvider.hospitalityStructure.chartColors;
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_3__reportlist_reportlist__["a" /* ReportListPage */], { unit: unit }, { animate: true, direction: 'forward' });
    };
    InspectionListPage.prototype.showSuperDataPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__superdata_superdata__["a" /* SuperDataPage */], {
            accountOverallIssueTypeCounts: this.accountOverallIssueTypeCounts,
            accountOverallItemsInspected: this.accountOverallItemsInspected,
            accountScoreCategories: this.accountScoreCategories,
            accountOverallScoreSum: this.accountOverallScoreSum,
            accountPotentialRevenue: this.potentialRevenue,
            accountTotalFlags: this.accountTotalFlags,
            accountTotalProjects: this.projectsWorthStarting,
            accountSortedUnitScores: this.accountSortedUnitScores,
            dataByTemplate: this.dataByTemplate,
            dataByRoom: this.dataByRoom,
            accountSortedRoomScores: this.accountSortedRoomScores,
            accountZenSortedArrays: this.accountZenSortedArrays,
            accountFlagCategoriesSortedCounts: this.accountFlagCategoriesSortedCounts,
            accountUnitsSortedByRevenue: this.accountUnitsSortedByRevenue
        }, { animate: true, direction: 'forward' });
    };
    return InspectionListPage;
}());
InspectionListPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-inspection',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/inspectionlist/inspectionlist.html"*/'  <ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title>\n      <img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile">\n    </ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main home-page">\n  <ion-grid>\n    <ion-row class="page-nav">\n      <ion-col col-6>\n        <h2 class="page-header">Program Performance</h2>\n        <p class="negative-margin" *ngIf="dataProvider.allUnits.data.length > 0">Based on saved report data</p>\n        <p class="negative-margin" *ngIf="(dataProvider.allUnits.data.length === 0) && dataProvider.emptyUnitList">\n          Add a unit on the admin page to get started.\n        </p>\n      </ion-col>\n      <ion-col col-6 class="text-align-right">\n        <button ion-button class="light-purple" (click)="showSuperDataPage()"><div><img src="assets/icon/data-view.svg" alt="pie chart" > <p>Data <br />View</p></div></button>\n      </ion-col>\n    </ion-row>\n    <ion-row class="donut-header">\n      <ion-col col-6 col-md-3 class="donut-side">\n        <div *ngIf="accountSortedUnitScores.length" class="graph">\n          <canvas baseChart [data]="[(accountOverallScoreSum / accountSortedUnitScores.length),(10 - (accountOverallScoreSum / accountSortedUnitScores.length))]" [chartType]="\'doughnut\'"\n            [colors]="dataProvider.hospitalityStructure.chartColors" [options]="doughnutChartSettings.options"></canvas>\n          <div class="inside-donut">\n            <h2>\n              {{ (accountOverallScoreSum / accountSortedUnitScores.length) | number:\'1.2-2\' }}\n              <!--<span class="decimals">{{ overallAccountScore.remainderPortion }}</span>-->\n              <span class="label">Unit Avg.<br /> Score</span>\n            </h2>\n          </div>\n        </div>\n      </ion-col>\n      <ion-col col-12 col-md-6>\n        <ion-row class="nopadding">\n      <ion-col col-6>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <h3>{{ dataProvider.allUnits.data.length }}</h3>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <p class="number-label">Units</p>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <ul>\n              <li class="highest">{{accountScoreCategories[\'Luxury\']}}</li>\n              <li class="">{{accountScoreCategories[\'Deluxe\']}}</li>\n              <li class="">{{accountScoreCategories[\'Standard\']}}</li>\n              <li class="">{{accountScoreCategories[\'Budget\']}}</li>\n              <li class="">{{accountScoreCategories[\'NA\']}}</li>\n            </ul>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <ul>\n              <li class="highest">Luxury</li>\n              <li class="">Deluxe</li>\n              <li class="">Standard</li>\n              <li class="">Budget</li>\n              <li class="">N/A</li>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <ion-col col-6>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <h3>{{ accountOverallItemsInspected }}</h3>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <p class="number-label">Items\n              <br />Inspected</p>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <ul>\n              <li class="highest">{{ accountOverallIssueTypeCounts[\'Urgent\'] }}</li>\n              <li>{{ accountOverallIssueTypeCounts[\'Serious\'] }}</li>\n              <li>{{ accountOverallIssueTypeCounts[\'Immediate\'] }}</li>\n              <li>{{ accountOverallIssueTypeCounts[\'Delayed\'] }}</li>\n              <li>{{ accountOverallIssueTypeCounts[\'Zen\'] }}</li>\n            </ul>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <ul>\n              <li class="highest">Urgent</li>\n              <li>Serious</li>\n              <li>Immediate</li>\n              <li>Delayed</li>\n              <li>Zen</li>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n    </ion-row>\n    <ion-row>\n      <ion-col>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <h3 class="potential-revenue">{{potentialRevenue | currency:\'USD\':true:\'1.0-0\' }}</h3>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <p class="number-label">Potential\n              <br />Revenue</p>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n    </ion-row>\n  </ion-col>\n      <ion-col col-6 col-md-3>\n\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <h3>{{ accountTotalFlags }}</h3>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <p class="number-label">Flagged\n              <br />Items</p>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <ul>\n              <ng-container *ngFor="let category of accountFlagCategoriesSortedCounts; let i = index;">\n                <li *ngIf="category.count !== 0" [ngClass]="{ \'highest\': i === 0 }">{{ category.count }}</li>\n              </ng-container>\n            </ul>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <ul>\n              <ng-container *ngFor="let category of accountFlagCategoriesSortedCounts; let i = index;">\n                <li *ngIf="category.count !== 0" [ngClass]="{ \'highest\': i === 0 }">{{ category.category }}</li>\n              </ng-container>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n\n    </ion-row>\n\n    <div class="reporting-selection table">\n      <ion-row *ngIf="dataProvider.allUnits.data.length > 0" class="table-header">\n        <ion-col col-6 col-md-4>\n          <div class="list-header" item-left>\n            Unit\n          </div>\n        </ion-col>\n        <ion-col col-3 col-md-2>\n          <div class="list-header" item-left>\n            Activity\n          </div>\n        </ion-col>\n        <ion-col col-3 col-md-2>\n          <div class="list-header" item-left>\n            Next Inspection\n          </div>\n        </ion-col>\n        <ion-col col-6 col-md-2>\n        </ion-col>\n        <ion-col col-6 col-md-2>\n        </ion-col>\n      </ion-row>\n\n      <ion-row *ngFor="let unit of dataProvider.allUnits.data">\n        <ion-col tappable col-6 col-md-4 (click)="showInspectionCreatorPage(unit)">\n          <p class="unit-name">{{unit.name}}</p>\n          <p>{{unit.unitTemplate.displayName}}</p>\n        </ion-col>\n        <ion-col col-3 col-md-2>\n          <p>{{ (mostRecentActivities[unit._id] | date:\'MMM y\') || \'N/A\' }}</p>\n        </ion-col>\n        <ion-col col-3 col-md-2>\n          <p>\n            {{dataProvider.getNextInspecDate(unit._id, allInspectionIDs) | date:\'MMM y\'}}\n          </p>\n        </ion-col>\n        <ion-col class="button lightest-purple" col-6 col-md-2>\n          <button class="light-purple" ion-button type="submit" (click)="showInspectionCreatorPage(unit)">\n            <img src="assets/icon/inspection.svg" alt="Magnifying glass">\n          </button>\n        </ion-col>\n        <ion-col class="button light-purple" col-6 col-md-2>\n          <button ion-button type="submit" (click)="showReportListPage(unit)">\n            <img src="assets/icon/report-writing.svg" alt="Report Writing">\n          </button>\n        </ion-col>\n      </ion-row>\n\n      <ion-row *ngIf="(dataProvider.allUnits.data.length === 0) && !dataProvider.emptyUnitList">\n        <ion-col>\n          <ion-spinner></ion-spinner>\n        </ion-col>\n      </ion-row>\n    </div>\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/inspectionlist/inspectionlist.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_5__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_6__providers_auth_service__["a" /* AuthService */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* LoadingController */]])
], InspectionListPage);

//# sourceMappingURL=inspectionlist.js.map

/***/ }),

/***/ 135:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DropboxProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_transfer__ = __webpack_require__(249);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__ = __webpack_require__(252);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_dropbox__ = __webpack_require__(494);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_dropbox___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_dropbox__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var DropboxProvider = (function () {
    function DropboxProvider(http, transfer) {
        this.http = http;
        this.transfer = transfer;
        this.dbx = null;
        this.userPath = '';
    }
    DropboxProvider.prototype.setAccessToken = function (token, userpath) {
        this.userPath = userpath;
        this.accessToken = token;
        this.dbx = new __WEBPACK_IMPORTED_MODULE_4_dropbox___default.a({ accessToken: token });
    };
    DropboxProvider.prototype.upload = function (name, file, location) {
        var pathWithUser = '/' + this.userPath + location + '/' + name;
        console.log('uploading to path: ' + pathWithUser);
        return this.dbx.filesUpload({ path: pathWithUser, contents: file })
            .then(function (response) {
            console.log('File uploaded!');
            return response;
        })
            .catch(function (error) {
            console.error(error);
            return null;
        });
    };
    ;
    DropboxProvider.prototype.uploadAPI = function (name, file, location) {
        var pathWithUser = '/' + this.userPath + location + '/' + name;
        console.log('Uploading to path ' + pathWithUser);
        var fileTransfer = this.transfer.create();
        var dbEndpoint = 'https://content.dropboxapi.com/2/files/upload';
        var dbAPIArg = '{\"path\": \"' + pathWithUser + '",\"mode\": \"overwrite\",\"mute\": true}';
        var options = {
            fileKey: 'file',
            fileName: name,
            mimeType: 'image/jpeg',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg': dbAPIArg
            }
        };
        return fileTransfer.upload(file, dbEndpoint, options)
            .then(function (data) {
            console.log('Made the upload to dropbox');
            return true;
        }, function (err) {
            console.error(err);
            return false;
        });
        // From DB docs on how to use REST API:
        /*
        curl -X POST https://content.dropboxapi.com/2/files/upload \
        --header "Authorization: Bearer <token>" \
        --header "Dropbox-API-Arg: {\"path\": \"/Homework/math/Matrices.txt\",\"mode\": \"add\",\"autorename\": true,\"mute\": false}" \
        --header "Content-Type: application/octet-stream" \
        --data-binary @local_file.txt
        */
    };
    ;
    DropboxProvider.prototype.createShareLink = function (path) {
        var pathWithUser = '/' + this.userPath + path;
        return this.dbx.sharingCreateSharedLink({ path: pathWithUser, pending_upload: { '.tag': 'file' } })
            .then(function (response) {
            console.log('Link created! Url is ' + response.url);
            return response;
        })
            .catch(function (error) {
            console.log("PROBLEM MAKING SHARE LINK");
            console.error(error);
            console.log("Now retrying");
            return this.dbx.sharingCreateSharedLink({ path: pathWithUser, pending_upload: { '.tag': 'file' } })
                .then(function (response) {
                console.log('Link created! Url is ' + response.url);
                return response;
            });
        });
    };
    ;
    // This SDK function provides Dropbox with a path to an image and a desired thumbnail size. Dropbox returns a fileblob of that thumbnail
    // Docs are at http://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesGetThumbnail__anchor
    // Possible sizes are: 'w32h32' | 'w64h64' | 'w128h128' | 'w640h480' | 'w1024h768'
    DropboxProvider.prototype.filesGetThumbnail = function (path, sizeTag) {
        var pathWithUser = '/' + this.userPath + path;
        return this.dbx.filesGetThumbnail({ path: pathWithUser, size: { '.tag': sizeTag }, mode: { '.tag': 'bestfit' } })
            .then(function (response) {
            console.log('Thumbnail created!');
            return response;
        })
            .catch(function (error) {
            console.error(error);
            return null;
        });
    };
    ;
    return DropboxProvider;
}());
DropboxProvider = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_transfer__["a" /* Transfer */]])
], DropboxProvider);

//# sourceMappingURL=dropbox.js.map

/***/ }),

/***/ 14:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Data; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_pouchdb__ = __webpack_require__(487);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lodash__ = __webpack_require__(259);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dropbox_dropbox__ = __webpack_require__(135);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var db_batch_size = 500;
/*
  Generated class for the Data provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
var Data = (function () {
    function Data(/*private zone: NgZone,*/ dropbox, domsanitizer) {
        this.dropbox = dropbox;
        this.domsanitizer = domsanitizer;
        // This function is used to get a type/condition template object based on type and option ids
        this.getOptionTemplateFromID = function (typeID, optionID) {
            if (this.inspectionTemplate.typesConditions && this.inspectionTemplate.typesConditions[typeID]) {
                for (var _i = 0, _a = this.inspectionTemplate.typesConditions[typeID].options; _i < _a.length; _i++) {
                    var optionGroup = _a[_i];
                    for (var _b = 0, optionGroup_1 = optionGroup; _b < optionGroup_1.length; _b++) {
                        var option = optionGroup_1[_b];
                        if (option.optionID === optionID) {
                            return option;
                        }
                    }
                }
            }
            return null;
        };
        __WEBPACK_IMPORTED_MODULE_2_pouchdb__["a" /* default */].plugin(__webpack_require__(508));
        __WEBPACK_IMPORTED_MODULE_2_pouchdb__["a" /* default */].plugin(__webpack_require__(558));
        this.resetAll();
        this.defaultRoomOrder = [
            'GENERAL',
            'ENTRY/HALLWAY',
            'LANAI',
            'KITCHEN',
            'LIVING ROOM',
            'DINING ROOM',
            'MASTER BATHROOM',
            '2ND MASTER BATHROOM',
            'GUEST BATHROOM',
            "2ND GUEST BATHROOM",
            'BATHROOM #1',
            'BATHROOM #2',
            'BATHROOM #3',
            "BATHROOM #4",
            'MASTER BEDROOM',
            '2ND MASTER BEDROOM',
            "3RD MASTER BEDROOM",
            'GUEST BEDROOM',
            "2ND GUEST BEDROOM",
            "3RD GUEST BEDROOM",
            "4TH GUEST BEDROOM",
            'BEDROOM #1',
            'BEDROOM #2',
            'BEDROOM #3',
            "BEDROOM #4",
            "BEDROOM #5",
            "BEDROOM #6",
            "BEDROOM #7"
        ];
    }
    Data.prototype.resetAll = function () {
        this.db = null;
        this.isSyncing = false;
        this.dataByUnit = {};
        this.sortedHospRatings = [];
        this.currentVisit = null;
        this.currentUnsavedItemData = null;
        this.emptyUnitList = false;
        // This sets the # of tags in the room/overall tag lists (3-5 suggested)
        this.numberOfTagsForSummary = 5;
        this.inspectionData = { data: {} };
        this.inspectionObjList = { data: [] };
        this.allUnits = { data: [] };
        this.roomStructure = {};
        this.inspectionTemplate = {};
        this.templateStructure = {};
        this.hospitalityStructure = {
            count: 0,
            sum: 0,
            intPortion: '0',
            remainderPortion: '.00',
            unitClassification: ''
        };
        // roomItemKeysObjs array has objects like this {roomID, itemID}
        // Note that the items inspected count is not just issues (but all inspected items)
        this.issueStructure = {
            '_total': 0,
            '_itemsInspectedCount': 0,
            _flagsList: [],
            // "_installFlagsList": [],
            // "_replaceFlagsList": [],
            // "_repairFlagsList": [],
            '_keys': ['Urgent', 'Serious', 'Immediate', 'Delayed', 'Zen'],
            '_problemKeyDict': { 'Urgent': true, 'Serious': true, 'Immediate': true },
            '_tagCounts': {},
            '_tagHighestArray': [],
            'Urgent': {
                count: 0,
                timelineText: '< 30 days',
                roomItemKeysObjs: []
            },
            'Serious': {
                count: 0,
                timelineText: '< 6 months',
                roomItemKeysObjs: []
            },
            'Immediate': {
                count: 0,
                timelineText: '< 1 year',
                roomItemKeysObjs: []
            },
            'Delayed': {
                count: 0,
                timelineText: '< 2 years',
                roomItemKeysObjs: []
            },
            'Zen': {
                count: 0,
                timelineText: '2+ years',
                roomItemKeysObjs: []
            }
        };
        // Hardcoding this for now but in the future should come from the database
        // In initDB we call updateTemplateChoices so that '/Default' gets rewritten to be the account/username of logged in user
        this.templateChoices = [
            {
                "_id": "!templates/v6/1 Bed, 1 Bath/Default",
                "displayName": "Studio",
                "unitDetails": {
                    "bedrooms": 0,
                    "bathrooms": 1
                }
            }
        ];
    };
    ;
    Data.prototype.fileURIasSrc = function (fileURI) {
        return this.domsanitizer.bypassSecurityTrustResourceUrl(window['Ionic'].WebView.convertFileSrc(fileURI));
    };
    // This function modifies the ids of our hardcoded template choices
    // based on the username of the logged in user
    Data.prototype.updateTemplateChoices = function (username) {
        for (var _i = 0, _a = this.templateChoices; _i < _a.length; _i++) {
            var template = _a[_i];
            template._id = template._id.split('/Default').join('/' + username);
        }
    };
    // manualCall param is used when syncDB is called with the manual button
    // The idea is that only automatic calls when timer the recall in 5 minutes
    // but is a manual run is running when auto tries to run then the auto will try again in 5 minutes
    Data.prototype.syncDB = function (self, manualCall) {
        var _this = this;
        console.log('syncDB called');
        if (this.db && !this.isSyncing) {
            this.isSyncing = true;
            this.db.sync(this.remoteSyncDBString, { batch_size: db_batch_size })
                .on('change', function (info) {
                console.log('sync doc change');
            }).on('denied', function (err) {
                // a document failed to replicate (e.g. due to permissions)
                console.log('sync doc denied');
            }).on('complete', function (info) {
                // handle complete
                console.log('overall sync complete');
            }).on('error', function (err) {
                // handle error
                console.log('overall sync error');
                console.error(err);
            })
                .then(function () {
                _this.isSyncing = false;
                if (!manualCall) {
                    self.syncTimer();
                }
            })
                .catch(function (err) {
                _this.isSyncing = false;
                if (!manualCall) {
                    self.syncTimer();
                }
            });
        }
        else if (this.isSyncing && !manualCall) {
            self.syncTimer();
        }
    };
    ;
    /* tslint:disable */
    Data.prototype.syncTimer = function () {
        var _this = this;
        /* tslint:enable */
        console.log('syncTimer called');
        setTimeout(function () {
            _this.syncDB(_this, false);
        }, 5 * 60 * 1000);
    };
    ;
    /* tslint:disable */
    Data.prototype.manualDBSync = function () {
        /* tslint:enable */
        this.syncDB(this, true);
    };
    ;
    Data.prototype.initDB = function (username, credential) {
        var _this = this;
        if (this.db === null) {
            this.updateTemplateChoices(username);
            __WEBPACK_IMPORTED_MODULE_2_pouchdb__["a" /* default */].debug.disable();
            //PouchDB.debug.enable('*');
            this.remoteSyncDBString = 'https://';
            this.remoteSyncDBString += username + ':' + credential + '@';
            // marsi-real-world-v5 uses per organization records and new ids schema (!units etc)
            this.remoteSyncDBString += 'marsi-envoy.herokuapp.com/marsi-real-world-v6';
            //this.remoteSyncDBString = 'http://192.168.0.107:5984/marsi-real-world-v6'
            // Note - released this to production for local-only db testing on June 11 9PM
            var localDBString = username + '-live1-marsi-real-world-v6';
            // This was used for testing without requiring login previously
            /*if (username === '') {
             localDBString = 'pickettd-temp-marsi-real-world-v4';
             //temp-marsi-real-world-v4 has new ids schema (!units etc)
             this.remoteSyncDBString = 'https://mymarsi.cloudant.com/temp-marsi-real-world-v4';
             }*/
            // This sequence of try/catches is to support a graceful decline of performance for Safari support
            // First the app tries indexdb as a backend, then sqlite, then fruitdown, and finally websql
            // Because some versions of mobile Safari have a 50MB max size for websql, we request 49MB in that fallback case
            try {
                this.db = new __WEBPACK_IMPORTED_MODULE_2_pouchdb__["a" /* default */](localDBString + '-idb', { /*auto_compaction: true, */ adapter: 'idb' });
            }
            catch (idbError) {
                console.log(idbError);
                try {
                    this.db = new __WEBPACK_IMPORTED_MODULE_2_pouchdb__["a" /* default */](localDBString + '-sqlite', {
                        /*auto_compaction: true, */
                        adapter: 'cordova-sqlite',
                        iosDatabaseLocation: 'default'
                    });
                }
                catch (sqliteError) {
                    console.log(sqliteError);
                    try {
                        //this.db = new PouchDB(localDBString + '-fruitdown', {/*auto_compaction: true, */adapter: 'fruitdown'});
                        //}
                        //catch (fruitdownError) {
                        //console.log(fruitdownError);
                        //try {
                        this.db = new __WEBPACK_IMPORTED_MODULE_2_pouchdb__["a" /* default */](localDBString + '-websql', { /*auto_compaction: true, */ adapter: 'websql', size: 49 });
                    }
                    catch (webSqlError) {
                        console.error(webSqlError.message ? webSqlError.message : webSqlError);
                    }
                    //}
                }
            }
            console.log('Starting replication from cloud database');
            return new Promise(function (resolve) {
                _this.isSyncing = true;
                return _this.db.replicate.from(_this.remoteSyncDBString, { batch_size: db_batch_size })
                    .on('change', function (info) {
                    console.log('replicate change');
                }).on('denied', function (err) {
                    // a document failed to replicate (e.g. due to permissions)
                    console.log('replicate denied');
                }).on('complete', function (info) {
                    // handle complete
                    console.log('replicate complete');
                    //getDocuments();
                }).on('error', function (err) {
                    // handle error
                    console.log('replicate error');
                    console.error(err);
                })
                    .then(function () {
                    console.log('Call to replicate cloud database completed successfully');
                    _this.isSyncing = false;
                    return true;
                }).catch(function (error) {
                    console.log(error);
                    _this.isSyncing = false;
                    return false;
                }).then(function () {
                    _this.isSyncing = false;
                    // Putting in this extra then to act as a finally block
                    _this.getDocument('!access')
                        .then(function (accessResult) {
                        if (accessResult.dropbox) {
                            _this.dropbox.setAccessToken(accessResult.dropbox, username);
                        }
                    });
                    // This function will fill in the rest of the template options
                    // in the this.templateChoices structure (studio is in by default)
                    return _this.getAllTemplatesIDs(username).then(function () {
                        // console.log("current hardcoded default room order is");
                        // console.log(this.defaultRoomOrder);
                        // console.log("now finished getting all template IDs, going to get db's default room order");
                        // This function will look to see if this account has a default room order
                        return _this.getDocument('!defaultRoomOrder')
                            .then(function (defaultRoomResult) {
                            if (defaultRoomResult.roomOrder) {
                                // console.log("we got the db's default room order successfully")
                                _this.defaultRoomOrder = defaultRoomResult.roomOrder;
                                // console.log("now version of default room order set from DB is");
                                // console.log(this.defaultRoomOrder);
                            }
                        })
                            .catch(function (error) {
                            console.log("we did not find a default room order in the db, that is ok");
                            //console.log(error);
                            return false;
                            // Putting in this extra then to act as a finally block
                        }).then(function () {
                            resolve(_this.db);
                            // calling sync time for the first time
                            _this.syncDB(_this, false);
                            return false;
                        });
                    });
                });
            });
        }
        else {
            // In this case the db is already initialized
            return new Promise(function (resolve) {
                resolve(_this.db);
            });
        }
    };
    Data.prototype.getNextInspecDate = function (unitID, inspectionIDs) {
        if (!inspectionIDs[unitID])
            return;
        var rowIDString = inspectionIDs[unitID];
        var timestamp = rowIDString.substring(rowIDString.lastIndexOf('/') + 1, rowIDString.length).replace('Inspection ', '');
        var prevInspecDate = new Date(+timestamp);
        return prevInspecDate.setFullYear(prevInspecDate.getFullYear() + 1);
    };
    // This function takes an initial room ID and an itemID. Then it looks in the template and builds a list of all rooms with that item
    Data.prototype.findAllRooms = function (initialRoomID, itemID) {
        var returnArray = [];
        var justItemWithoutRoom = itemID.split(initialRoomID + '|').join('');
        for (var _i = 0, _a = this.inspectionTemplate.roomOrder; _i < _a.length; _i++) {
            var roomID = _a[_i];
            var itemInRoom = roomID + '|' + justItemWithoutRoom;
            if (this.inspectionTemplate.data[roomID].data[itemInRoom]) {
                returnArray.push(roomID);
            }
        }
        return returnArray;
    };
    // This function takes an inspection doc id as input, queries the db for all of its visit data,
    // merges them into the inspection data variable, and returns that
    Data.prototype.getVisitData = function (inspection) {
        var _this = this;
        var inspectionID = inspection._id;
        var inMemoryInspData = {};
        // Clear all previous room data
        for (var roomID in this.roomStructure) {
            delete this.roomStructure[roomID];
        }
        this.currentVisit = null;
        console.log('Querying visitData in db matching pattern: ' + 'visits/' + inspectionID.split('inspections/').join('') + '/');
        this.inspectionData._id = inspectionID;
        this.inspectionData.name = inspection.name;
        this.inspectionData.propertyName = inspection.propertyName;
        this.inspectionData.propertyID = inspection.propertyID;
        // We use the inspectionID as the default in case we need the inspection timestamp
        this.inspectionData.lastVisitID = inspectionID;
        this.dataByUnit[inspection.propertyID].lastVisitID = inspectionID;
        this.inspectionData.data = {};
        return this.db.allDocs({
            include_docs: true,
            startkey: 'visits/' + inspectionID.split('inspections/').join('') + '/',
            endkey: 'visits/' + inspectionID.split('inspections/').join('') + '/\uffff'
        }).then(function (result) {
            //this.zone.run(() => {
            /*
            //To debug particular visits and visit data can use snippets like
            let particularVisit = {};
                let visitDataIds = {};
                let visitIds = {};
                result.rows.map((row) => {
                    if (row.doc.visitID) {
                      if (row.doc.visitID === 'visits/NOELANI 109/Inspection 1500575166651/Noelani/Visit 1500674091898') {
                        _.merge(particularVisit, row.doc.data);
                        visitDataIds[row.id] = true;
                      }
                      visitIds[row.doc.visitID] = true;
                    }
                  });debugger;
            */
            // This takes all the visit data rows and merges into one inspectionData object
            var resultNumber = result.rows.length;
            if (result.rows && resultNumber) {
                result.rows.map(function (row) {
                    __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](inMemoryInspData, row.doc.data);
                });
                __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](_this.inspectionData.data, inMemoryInspData);
                if ((result.rows[resultNumber - 1]).doc && (result.rows[resultNumber - 1]).doc._id) {
                    var lastVisitID = (result.rows[resultNumber - 1]).doc._id;
                    _this.inspectionData.lastVisitID = lastVisitID;
                    _this.dataByUnit[inspection.propertyID].lastVisitID = lastVisitID;
                }
            }
            // Seems like this should be a better way to do this?
            _this.setupRoomStructure(inspection.propertyID, inMemoryInspData);
            //});
            return (_this.inspectionData);
        });
    };
    Data.prototype.getAllUnits = function (currentUsername) {
        var _this = this;
        console.log('Querying for all units in database');
        return new Promise(function (resolve) {
            var time1 = window.performance.now();
            // Note this method of on-the-fly map/reduce takes 2000ms
            // Also note that you need the line `declare const emit;` in file
            /*function unitById(doc) {
              if (doc.type === 'Unit') {
                emit(doc.id);
              }
            }
            this.db.query(unitById, {include_docs: true}).then((result: any) => {
              let time2 = window.performance.now();
              console.log(`Time to query with on the fly view is ${time2-time1}`);
              this.allUnits.data.splice(0);
              result.rows.map((row) => {
                this.allUnits.data.push(row.doc);
              });
              resolve(result);
            }).catch(function (err) {
              console.log(err);
              resolve(this.allUnits.data);
            });*/
            // Note this method of pre-built map/reduce takes 45ms
            /*let queryName = 'getUnits/all-units-by-id';
            this.db.query(queryName, {include_docs: true}).then((result: any) => {
              let time2 = window.performance.now();
              console.log(`Time to query with prebuilt view is ${time2-time1}`);
              this.allUnits.data.splice(0);
              result.rows.map((row) => {
                this.allUnits.data.push(row.doc);
              });
              resolve(result);
            })
            .catch((error) => {
              console.log(error);
              resolve(error);
            });*/
            // Note this method of allDocs then map filter takes 700ms
            /*this.db.allDocs({
              include_docs: true
            }).then((result) => {
              this.allUnits.data.splice(0);
      
              result.rows.map((row) => {
                if (row.doc.type === 'Unit') {
                  this.allUnits.data.push(row.doc);
                  console.log('Pushed unit');
                }
              });
              let time2 = window.performance.now();
              console.log(`Time to query with alldocs is ${time2-time1}`);
      
      
              resolve(result);
            }).catch((error) => {
              console.log(error);
            });*/
            //Note this just took 5.75 ms to get one doc (single key)
            //And it took 8.3ms to get 2 docs (keys array)
            /*this.db.allDocs({
              include_docs: true,
              keys: ['!units/HONOKOWAI PALMS A7','!units/KAPALUA GOLF VILLAS 17T8']
            }).then((result) => {
              this.allUnits.data.splice(0);
              this.emptyUnitList = false;
              result.rows.map((row) => {
                if ((row.doc) && (row.doc.type === 'Unit')) {
                  this.allUnits.data.push(row.doc);
                  console.log('Pushed unit');
                }
              });
              let time2 = window.performance.now();
              console.log(`Time to query with alldocs that uses key or keys is ${time2-time1}`);
              if (this.allUnits.data.length === 0) {
                this.emptyUnitList = true;
              }
      
              resolve(result);
            }).catch((error) => {
              console.log(error);
            });*/
            //Note this just took 7 ms to get the 2 test units by rewritting id pattern
            _this.db.allDocs({
                include_docs: true,
                startkey: '!units/',
                endkey: '!units/\uffff'
            }).then(function (result) {
                //this.zone.run(() => {
                _this.allUnits.data.splice(0);
                _this.emptyUnitList = false;
                result.rows.map(function (row) {
                    // this.allUnits.data.push(row.doc);
                    if (row.doc.unitTemplate && (row.doc.unitTemplate._id.indexOf(currentUsername) !== -1)) {
                        _this.allUnits.data.push(row.doc);
                        if (!(_this.dataByUnit[row.id])) {
                            _this.dataByUnit[row.id] = {
                                roomScores: [],
                                byUnitIssueStructure: {
                                    // Note that _total is only used for problem keys
                                    '_total': 0,
                                    _flagsList: [],
                                    // "_installFlagsList": [],
                                    // "_replaceFlagsList": [],
                                    // "_repairFlagsList": [],
                                    '_keys': ['Urgent', 'Serious', 'Immediate', 'Delayed', 'Zen'],
                                    '_problemKeyDict': { 'Urgent': true, 'Serious': true, 'Immediate': true },
                                    '_tagCounts': {},
                                    '_tagHighestArray': [],
                                    'Urgent': {
                                        count: 0,
                                        timelineText: '< 30 days',
                                        roomItemKeysObjs: []
                                    },
                                    'Serious': {
                                        count: 0,
                                        timelineText: '< 6 months',
                                        roomItemKeysObjs: []
                                    },
                                    'Immediate': {
                                        count: 0,
                                        timelineText: '< 1 year',
                                        roomItemKeysObjs: []
                                    },
                                    'Delayed': {
                                        count: 0,
                                        timelineText: '< 2 years',
                                        roomItemKeysObjs: []
                                    },
                                    'Zen': {
                                        count: 0,
                                        timelineText: '2+ years',
                                        roomItemKeysObjs: []
                                    }
                                }
                            };
                        }
                        console.log('Loaded filtered unit for this account');
                    }
                });
                var time2 = window.performance.now();
                console.log("Time to query with alldocs that uses start/end is " + (time2 - time1));
                if (_this.allUnits.data.length === 0) {
                    _this.emptyUnitList = true;
                }
                resolve(_this.allUnits.data);
                //});
            }).catch(function (error) {
                console.log(error);
            });
        });
    };
    Data.prototype.getAllInspectionIDs = function () {
        console.log('Querying all inspection id in db');
        var returnObj = {};
        return this.db.allDocs({
            include_docs: false,
            startkey: 'inspections/',
            endkey: 'inspections/\uffff'
        })
            .then(function (result) {
            result.rows.map(function (row) {
                // Need to peel out the inspections by unit here
                // Each row.id will be of the format:
                // 'inspections/<Unit ID w/o !units/>/Inspection <timestamp>'
                // eg. inspections/TEST 2/Inspection 1501004409099
                // So we can create a structure in the return object like:
                // <parse unitID>
                // if (!returnObj[unitID]) {returnObj[unitID] = {};}
                // returnObj[unitID] = row.id
                var rowID = row.id;
                // IDs are ordered lexographically in couchDB
                // Since inspection IDs have timestamps at the end
                // This logic of assigning to unitID should always
                // have the latest inspection at the end.
                var unitID = '!units/' + rowID.substring(rowID.indexOf('/') + 1, rowID.lastIndexOf('/'));
                if (!returnObj[unitID]) {
                    returnObj[unitID] = {};
                }
                returnObj[unitID] = row.id;
            });
            return returnObj;
        });
    };
    Data.prototype.getInspections = function (unit) {
        var _this = this;
        // This is a hack to hide report data until data is loaded
        delete this.hospitalityStructure.chartColors;
        console.log('Querying inspections in db matching unitID: ' + unit._id);
        var unitIDQuery = unit._id.split('!units/').join('');
        return this.db.allDocs({
            include_docs: true,
            startkey: 'inspections/' + unitIDQuery + '/Inspection ',
            endkey: 'inspections/' + unitIDQuery + '/Inspection \uffff'
        })
            .then(function (result) {
            //this.zone.run(() => {
            _this.inspectionObjList.data.splice(0);
            result.rows.map(function (row) {
                _this.inspectionObjList.data.push(row.doc);
            });
            //});
            return _this.inspectionObjList.data;
        });
    };
    Data.prototype.getAllTemplatesIDs = function (username) {
        var _this = this;
        return this.db.allDocs({
            include_docs: false,
            startkey: '!templates/',
            endkey: '!templates/\uffff'
        })
            .then(function (result) {
            result.rows.map(function (row) {
                if (row.id.indexOf(username) !== -1) {
                    var idParts = row.id.split('/');
                    var templateChoice = {};
                    templateChoice._id = row.id;
                    templateChoice.displayName = idParts[2];
                    var nameParts = idParts[2].split('Bed,');
                    var bedrooms = parseInt(nameParts[0].trim());
                    var bathrooms = parseInt(nameParts[1].split('Bath')[0].trim());
                    templateChoice.unitDetails = {};
                    templateChoice.unitDetails.bedrooms = bedrooms;
                    templateChoice.unitDetails.bathrooms = bathrooms;
                    _this.templateChoices.push(templateChoice);
                }
            });
            return _this.templateChoices;
        });
    };
    // Note - this function is intended to be used for things like which items to highlight and other customizations.
    // But using it hasn't been incorporated into the inspection logic yet.
    Data.prototype.getAllTemplatesPreferences = function (username) {
        var returnObj = {};
        return this.db.allDocs({
            include_docs: true,
            startkey: '!templatePreferences/' + username + '/',
            endkey: '!templatePreferences/' + username + '/\uffff'
        })
            .then(function (result) {
            result.rows.map(function (row) {
                __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](returnObj, row.doc);
            });
            return returnObj;
        });
    };
    Data.prototype.getTemplateById = function (templateId) {
        var _this = this;
        delete this.inspectionTemplate.data;
        delete this.inspectionTemplate.roomOrder;
        this.templateStructure = {};
        console.log('Getting template: ' + templateId);
        return new Promise(function (resolve) {
            _this.getDocument(templateId)
                .then(function (result) {
                //this.zone.run(() => {
                _this.inspectionTemplate.typesConditions = result.typesConditions;
                if (typeof (result.roomOrder) !== 'undefined') {
                    _this.inspectionTemplate.roomOrder = result.roomOrder;
                }
                else {
                    _this.setRoomOrderDefault();
                }
                _this.inspectionTemplate.trades = result.trades;
                if (!result.roomAliases) {
                    result.roomAliases = {};
                }
                ;
                _this.inspectionTemplate.roomAliases = result.roomAliases;
                _this.templateStructure.tradeIDs = [];
                _this.templateStructure.typeConditionsByItemID = {};
                _this.inspectionTemplate.inspectionWorkTrackingConditions = result.inspectionWorkTrackingConditions;
                _this.templateStructure.timelineKeys = Object.keys(result.inspectionWorkTrackingConditions.data);
                for (var tradeID in result.trades) {
                    _this.templateStructure.tradeIDs.push(tradeID);
                    var trade = result.trades[tradeID];
                    for (var roomID in trade.rooms) {
                        if (typeof (_this.templateStructure[roomID]) === 'undefined') {
                            _this.templateStructure[roomID] = { items: [], itemsByTrade: {}, tradeIDs: [] };
                        }
                        _this.templateStructure[roomID].itemsByTrade[tradeID] = [];
                        _this.templateStructure[roomID].tradeIDs.push(tradeID);
                    }
                }
                _this.inspectionTemplate.data = result.data;
                // Use for...in because these are objects/keys
                for (var roomID in _this.inspectionTemplate.data) {
                    // Inventory really shouldn't be in this part of the template, but have to work around for now
                    if (roomID !== 'Inventory') {
                        for (var itemID in _this.inspectionTemplate.data[roomID].data) {
                            var itemObj = _this.inspectionTemplate.data[roomID].data[itemID];
                            _this.templateStructure[roomID].items.push(itemObj);
                            if (_this.templateStructure[roomID].itemsByTrade[(itemObj['Trade or Service'])]) {
                                _this.templateStructure[roomID].itemsByTrade[(itemObj['Trade or Service'])].push(itemObj);
                            }
                            if (typeof (_this.templateStructure.typeConditionsByItemID[itemID]) === 'undefined') {
                                _this.templateStructure.typeConditionsByItemID[itemID] = [];
                            }
                            for (var conditionID in itemObj.typesConditions) {
                                _this.templateStructure.typeConditionsByItemID[itemID].push(conditionID);
                            }
                        }
                    }
                }
                //});
                resolve(_this.inspectionTemplate);
                return _this.inspectionTemplate;
            })
                .catch(function (error) {
                console.log(error);
            });
        });
    };
    // Inspection name and htmlInspectionTmplVer parameters are optional
    Data.prototype.createNewInspection = function (unit, inspectionName, htmlInspectionTmplVer) {
        // Putting in this quick/dirty way because using something like Date.toLocaleString is supported in older browsers consistantly
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        var dateTimeNow = new Date();
        var newName = inspectionName;
        var newHtmlInspectionTmplVer = htmlInspectionTmplVer;
        // v5 is the last HTML template used in marsi-prototyping (v1) repo.
        // So far this sara-marsi-ionic2 (v2) repo is not using a HTML template versioning system though (Jun 05 2017)
        if (typeof (htmlInspectionTmplVer) === 'undefined') {
            newHtmlInspectionTmplVer = 'v5';
        }
        // Inspections can be given names by the user but right now in the first release of this repo we'll just use month plus year
        if (typeof (inspectionName) === 'undefined') {
            newName = monthNames[dateTimeNow.getMonth()] + ' ' + dateTimeNow.getFullYear();
        }
        else {
            newName = newName.trim();
        }
        var newInspDoc = {
            _id: 'inspections/' + unit._id.split('!units/').join('') + '/Inspection ' + dateTimeNow.getTime(),
            type: 'Inspection',
            name: newName,
            propertyID: unit._id,
            propertyName: unit.name,
            templateID: unit.unitTemplate._id,
            htmlInspectionTmplVer: newHtmlInspectionTmplVer
        };
        return this.saveDocument(newInspDoc);
    };
    // newInspName is an optional parameter
    Data.prototype.createNewUnit = function (newUnitObj, newInspName) {
        var _this = this;
        newUnitObj.name = newUnitObj.name.trim();
        var newUnitDoc = {
            _id: '!units/' + newUnitObj.name.toUpperCase(),
            name: newUnitObj.name,
            type: 'Unit',
            unitTemplate: newUnitObj.unitTemplate
        };
        this.allUnits.data.push(newUnitDoc);
        // Create unit in DB and then create inspection in db
        // (don't do in parallel or you may get accidental/orphaned new inspections)
        // Passing undefined for the html inspection template version so that it will just use the default
        return this.saveDocument(newUnitDoc)
            .then(function (result) {
            return _this.createNewInspection(newUnitDoc, newInspName, undefined)
                .then(function (result) {
                _this.manualDBSync();
                return result;
            });
        });
    };
    ;
    // We will base the construction of owner report docs on the inspection id (because that is the assumption now, one template for one inspection for one report)
    Data.prototype.saveOwnerReport = function (currentReportRef, prevReportObj, inspection, userID, roomID) {
        var foundChangeToSave = false;
        var newInspectionID = inspection._id.split('inspections/').join('');
        var reportObjToSave = {};
        // Deep copy the current report data (data won't have function properties or Date strings so this method should be a fast/native way to deep copy)
        // See https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript answers for details
        var currentReportObj = JSON.parse(JSON.stringify(currentReportRef));
        var newReportDoc = {
            _id: 'reports/' + newInspectionID + '/' + userID + '/Report ' + new Date().getTime(),
            type: 'Owner Report',
            inspectionID: inspection._id,
            userID: userID,
            lastVisitID: inspection.lastVisitID,
            reportDataDict: {}
        };
        if (this.issueStructure._flagsList) {
            if (!currentReportObj.flagCount || (currentReportObj.flagCount !== this.issueStructure._flagsList.length)) {
                reportObjToSave['flagCount'] = this.issueStructure._flagsList.length;
                foundChangeToSave = true;
            }
        }
        if (this.hospitalityStructure.count && this.hospitalityStructure.intPortion && this.hospitalityStructure.remainderPortion) {
            var currentScoreString = this.hospitalityStructure.intPortion + this.hospitalityStructure.remainderPortion;
            if (!currentReportObj.scoreString || (currentReportObj.scoreString !== currentScoreString)) {
                reportObjToSave['scoreString'] = currentScoreString;
                foundChangeToSave = true;
            }
        }
        if (roomID === 'UNIT SUMMARY') {
            if (currentReportObj.unitSummary !== prevReportObj.unitSummary) {
                reportObjToSave['unitSummary'] = currentReportObj.unitSummary;
                foundChangeToSave = true;
            }
            for (var _i = 0, _a = currentReportObj.victoriesList; _i < _a.length; _i++) {
                var victObj = _a[_i];
                var isNewVict = true;
                var hasNewText = true;
                var hasNewRemovedState = true;
                if (prevReportObj['victoryObjDict']) {
                    isNewVict = !prevReportObj['victoryObjDict'][victObj._id];
                    if (prevReportObj['victoryObjDict'][victObj._id]) {
                        hasNewText = (prevReportObj['victoryObjDict'][victObj._id].text !== victObj.text);
                        hasNewRemovedState = (prevReportObj['victoryObjDict'][victObj._id].removeMe !== victObj.removeMe);
                    }
                }
                if (isNewVict) {
                    if (!reportObjToSave['victoryObjDict']) {
                        reportObjToSave['victoryObjDict'] = {};
                    }
                    reportObjToSave['victoryObjDict'][victObj._id] = victObj;
                    foundChangeToSave = true;
                }
                if (hasNewText) {
                    if (!reportObjToSave['victoryObjDict']) {
                        reportObjToSave['victoryObjDict'] = {};
                    }
                    if (!reportObjToSave['victoryObjDict'][victObj._id]) {
                        reportObjToSave['victoryObjDict'][victObj._id] = {};
                    }
                    reportObjToSave['victoryObjDict'][victObj._id].text = victObj.text;
                    foundChangeToSave = true;
                }
                if (hasNewRemovedState) {
                    if (!reportObjToSave['victoryObjDict']) {
                        reportObjToSave['victoryObjDict'] = {};
                    }
                    if (!reportObjToSave['victoryObjDict'][victObj._id]) {
                        reportObjToSave['victoryObjDict'][victObj._id] = {};
                    }
                    reportObjToSave['victoryObjDict'][victObj._id].removeMe = victObj.removeMe;
                    foundChangeToSave = true;
                }
            }
            for (var _b = 0, _c = currentReportObj.failuresList; _b < _c.length; _b++) {
                var failObj = _c[_b];
                var isNewFail = true;
                var hasNewText = true;
                var hasNewRemovedState = true;
                if (prevReportObj['failureObjDict']) {
                    isNewFail = !prevReportObj['failureObjDict'][failObj._id];
                    if (prevReportObj['failureObjDict'][failObj._id]) {
                        hasNewText = (prevReportObj['failureObjDict'][failObj._id].text !== failObj.text);
                        hasNewRemovedState = (prevReportObj['failureObjDict'][failObj._id].removeMe !== failObj.removeMe);
                    }
                }
                if (isNewFail) {
                    if (!reportObjToSave['failureObjDict']) {
                        reportObjToSave['failureObjDict'] = {};
                    }
                    reportObjToSave['failureObjDict'][failObj._id] = failObj;
                    foundChangeToSave = true;
                }
                if (hasNewText) {
                    if (!reportObjToSave['failureObjDict']) {
                        reportObjToSave['failureObjDict'] = {};
                    }
                    if (!reportObjToSave['failureObjDict'][failObj._id]) {
                        reportObjToSave['failureObjDict'][failObj._id] = {};
                    }
                    reportObjToSave['failureObjDict'][failObj._id].text = failObj.text;
                    foundChangeToSave = true;
                }
                if (hasNewRemovedState) {
                    if (!reportObjToSave['failureObjDict']) {
                        reportObjToSave['failureObjDict'] = {};
                    }
                    if (!reportObjToSave['failureObjDict'][failObj._id]) {
                        reportObjToSave['failureObjDict'][failObj._id] = {};
                    }
                    reportObjToSave['failureObjDict'][failObj._id].removeMe = failObj.removeMe;
                    foundChangeToSave = true;
                }
            }
        }
        else if (roomID === 'PROJECTS') {
            for (var _d = 0, _e = currentReportObj.projObjList; _d < _e.length; _d++) {
                var projObj = _e[_d];
                var isNewProj = true;
                var hasNewDesc = true;
                var hasNewLow = true;
                var hasNewHigh = true;
                var hasNewRemovedState = true;
                if (prevReportObj['projObjDict']) {
                    isNewProj = !prevReportObj['projObjDict'][projObj._id];
                    if (prevReportObj['projObjDict'][projObj._id]) {
                        hasNewDesc = (prevReportObj['projObjDict'][projObj._id].description !== projObj.description);
                        hasNewRemovedState = (prevReportObj['projObjDict'][projObj._id].removeMe !== projObj.removeMe);
                        if (prevReportObj['projObjDict'][projObj._id].estimate) {
                            hasNewLow = (prevReportObj['projObjDict'][projObj._id].estimate.lower !== projObj.estimate.lower);
                            hasNewHigh = (prevReportObj['projObjDict'][projObj._id].estimate.upper !== projObj.estimate.upper);
                        }
                    }
                }
                if (isNewProj) {
                    if (!reportObjToSave['projObjDict']) {
                        reportObjToSave['projObjDict'] = {};
                    }
                    reportObjToSave['projObjDict'][projObj._id] = projObj;
                    foundChangeToSave = true;
                }
                if (hasNewDesc) {
                    if (!reportObjToSave['projObjDict']) {
                        reportObjToSave['projObjDict'] = {};
                    }
                    if (!reportObjToSave['projObjDict'][projObj._id]) {
                        reportObjToSave['projObjDict'][projObj._id] = {};
                    }
                    reportObjToSave['projObjDict'][projObj._id].description = projObj.description;
                    foundChangeToSave = true;
                }
                if (hasNewLow) {
                    if (!reportObjToSave['projObjDict']) {
                        reportObjToSave['projObjDict'] = {};
                    }
                    if (!reportObjToSave['projObjDict'][projObj._id]) {
                        reportObjToSave['projObjDict'][projObj._id] = {};
                    }
                    if (!reportObjToSave['projObjDict'][projObj._id].estimate) {
                        reportObjToSave['projObjDict'][projObj._id].estimate = {};
                    }
                    reportObjToSave['projObjDict'][projObj._id].estimate.lower = projObj.estimate.lower;
                    foundChangeToSave = true;
                }
                if (hasNewHigh) {
                    if (!reportObjToSave['projObjDict']) {
                        reportObjToSave['projObjDict'] = {};
                    }
                    if (!reportObjToSave['projObjDict'][projObj._id]) {
                        reportObjToSave['projObjDict'][projObj._id] = {};
                    }
                    if (!reportObjToSave['projObjDict'][projObj._id].estimate) {
                        reportObjToSave['projObjDict'][projObj._id].estimate = {};
                    }
                    reportObjToSave['projObjDict'][projObj._id].estimate.upper = projObj.estimate.upper;
                    foundChangeToSave = true;
                }
                if (hasNewRemovedState) {
                    if (!reportObjToSave['projObjDict']) {
                        reportObjToSave['projObjDict'] = {};
                    }
                    if (!reportObjToSave['projObjDict'][projObj._id]) {
                        reportObjToSave['projObjDict'][projObj._id] = {};
                    }
                    reportObjToSave['projObjDict'][projObj._id].removeMe = projObj.removeMe;
                    foundChangeToSave = true;
                }
            }
        }
        else {
            var foundRoom = false;
            var roomIndex = 0;
            var roomLength = currentReportObj.roomObjList.length;
            for (roomIndex = 0; roomIndex < roomLength; roomIndex++) {
                if (currentReportObj.roomObjList[roomIndex].name === roomID) {
                    foundRoom = true;
                    break;
                }
            }
            if (foundRoom && currentReportObj.roomObjList[roomIndex] && currentReportObj.roomObjList[roomIndex].selectedPicObjs) {
                for (var _f = 0, _g = currentReportObj.roomObjList[roomIndex].selectedPicObjs; _f < _g.length; _f++) {
                    var picObj = _g[_f];
                    var isNewPic = true;
                    var isPicWithNewComment = true;
                    var hasNewRemovedState = true;
                    if ((prevReportObj[roomID]) && (prevReportObj[roomID].picsObjDict)) {
                        isNewPic = !prevReportObj[roomID].picsObjDict[picObj._id];
                        if (prevReportObj[roomID].picsObjDict[picObj._id]) {
                            isPicWithNewComment = (prevReportObj[roomID].picsObjDict[picObj._id].comment !== picObj.comment);
                            hasNewRemovedState = (prevReportObj[roomID].picsObjDict[picObj._id].removeMe !== picObj.removeMe);
                        }
                    }
                    if (isNewPic) {
                        if (!reportObjToSave[roomID]) {
                            reportObjToSave[roomID] = { picsObjDict: {} };
                        }
                        if (!reportObjToSave[roomID].picsObjDict) {
                            reportObjToSave[roomID].picsObjDict = {};
                        }
                        reportObjToSave[roomID].picsObjDict[picObj._id] = picObj;
                        foundChangeToSave = true;
                    }
                    if (isPicWithNewComment) {
                        if (!reportObjToSave[roomID]) {
                            reportObjToSave[roomID] = { picsObjDict: {} };
                        }
                        if (!reportObjToSave[roomID].picsObjDict) {
                            reportObjToSave[roomID].picsObjDict = {};
                        }
                        if (!reportObjToSave[roomID].picsObjDict[picObj._id]) {
                            reportObjToSave[roomID].picsObjDict[picObj._id] = {};
                        }
                        reportObjToSave[roomID].picsObjDict[picObj._id].comment = picObj.comment;
                        foundChangeToSave = true;
                    }
                    if (hasNewRemovedState) {
                        if (!reportObjToSave[roomID]) {
                            reportObjToSave[roomID] = { picsObjDict: {} };
                        }
                        if (!reportObjToSave[roomID].picsObjDict) {
                            reportObjToSave[roomID].picsObjDict = {};
                        }
                        if (!reportObjToSave[roomID].picsObjDict[picObj._id]) {
                            reportObjToSave[roomID].picsObjDict[picObj._id] = {};
                        }
                        reportObjToSave[roomID].picsObjDict[picObj._id].removeMe = picObj.removeMe;
                        foundChangeToSave = true;
                    }
                }
                if ((!prevReportObj[roomID]) || (currentReportObj.roomObjList[roomIndex].summary !== prevReportObj[roomID].summary)) {
                    if (!reportObjToSave[roomID]) {
                        reportObjToSave[roomID] = {};
                    }
                    reportObjToSave[roomID].summary = currentReportObj.roomObjList[roomIndex].summary;
                    foundChangeToSave = true;
                }
            }
        }
        newReportDoc.reportDataDict = reportObjToSave;
        // These two lines are just for testing (really should be saving as is commented out)
        if (foundChangeToSave) {
            return this.saveDocument(newReportDoc)
                .then(function () {
                console.log('Saved report data to db');
                return newReportDoc;
            });
        }
        else {
            console.log('No changes to save in report');
            return Promise.resolve({ reportDataDict: prevReportObj });
        }
    };
    // Note that this functions requires this.allUnits to be populated
    Data.prototype.getAllReportsByUnit = function () {
        var _this = this;
        if (!this.allUnits.data.length) {
            return Promise.resolve([]);
        }
        else {
            return this.db.allDocs({
                include_docs: true,
                startkey: 'reports/',
                endkey: 'reports/\uffff'
            })
                .then(function (result) {
                var returnReport = {};
                result.rows.map(function (row) {
                    for (var index = 0, len = _this.allUnits.data.length; index < len; index++) {
                        var thisUnitID = _this.allUnits.data[index]._id;
                        var unitIDWithoutPrefix = thisUnitID.split('!units/').join('');
                        if ((row.doc._id.indexOf('/' + unitIDWithoutPrefix + '/')) !== -1) {
                            if (!returnReport[thisUnitID]) {
                                returnReport[thisUnitID] = { projObjDict: {} };
                            }
                            if (row.doc.reportDataDict && row.doc.reportDataDict.projObjDict) {
                                __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](returnReport[thisUnitID].projObjDict, row.doc.reportDataDict.projObjDict);
                                // Get the sum of proj est upper within the projObjDict and
                                // create a prop called potentialRevenue for the unit
                                // NOTE - right now this loop runs everytime there is a report record per unit
                                // could potentially make it faster if we run this logic per unit after all the result rows are mapped
                                returnReport[thisUnitID].potentialRevenue = 0;
                                var projKeys = Object.keys(returnReport[thisUnitID].projObjDict);
                                for (var index_1 = 0, len_1 = projKeys.length; index_1 < len_1; index_1++) {
                                    var thisProj = returnReport[thisUnitID].projObjDict[projKeys[index_1]];
                                    if (!thisProj.removeMe && thisProj.estimate) {
                                        returnReport[thisUnitID].potentialRevenue += thisProj.estimate.upper;
                                    }
                                }
                                _this.dataByUnit[thisUnitID].potentialRevenue = returnReport[thisUnitID].potentialRevenue;
                            }
                            if (row.doc.reportDataDict && row.doc.reportDataDict.flagCount) {
                                returnReport[thisUnitID].flagCount = row.doc.reportDataDict.flagCount;
                            }
                            if (row.doc.reportDataDict && row.doc.reportDataDict.scoreString) {
                                returnReport[thisUnitID].scoreString = row.doc.reportDataDict.scoreString;
                            }
                            delete row.doc.reportDataDict;
                            __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](returnReport[thisUnitID], row.doc);
                            break;
                        }
                    }
                });
                return returnReport;
            });
        }
    };
    // Note that this functions requires this.allUnits to be populated
    Data.prototype.getAllVisitsByUnit = function () {
        var _this = this;
        if (!this.allUnits.data.length) {
            return Promise.resolve([]);
        }
        else {
            console.time('inside_getAllVisitsByUnit-all');
            console.time('inside_getAllVisitsByUnit-start_getAllVisits');
            return this.db.allDocs({
                include_docs: true,
                startkey: 'visits/',
                endkey: 'visits/\uffff'
            })
                .then(function (result) {
                console.timeEnd('inside_getAllVisitsByUnit-start_getAllVisits');
                console.time('inside_getAllVisitsByUnit-start_mergeAllVisits');
                var returnReport = {};
                result.rows.map(function (row) {
                    for (var index = 0, len = _this.allUnits.data.length; index < len; index++) {
                        var thisUnitID = _this.allUnits.data[index]._id;
                        var unitIDWithoutPrefix = thisUnitID.split('!units/').join('');
                        if ((row.doc._id.indexOf('/' + unitIDWithoutPrefix + '/')) !== -1) {
                            if (!returnReport[thisUnitID]) {
                                returnReport[thisUnitID] = { data: {} };
                            }
                            __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](returnReport[thisUnitID].data, row.doc.data);
                            break;
                        }
                    }
                });
                console.timeEnd('inside_getAllVisitsByUnit-start_mergeAllVisits');
                console.timeEnd('inside_getAllVisitsByUnit-all');
                return returnReport;
            });
        }
    };
    // Note that we do build the report doc id using the user id of the person that created the report.
    // But to get report data on a unit/inspection we gather from all users
    Data.prototype.getOwnerReport = function (inspectionID) {
        var newInspectionID = inspectionID.split('inspections/').join('');
        return this.db.allDocs({
            include_docs: true,
            startkey: 'reports/' + newInspectionID + '/',
            endkey: 'reports/' + newInspectionID + '/\uffff'
        })
            .then(function (result) {
            var returnReport = {};
            result.rows.map(function (row) {
                __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](returnReport, row.doc.reportDataDict);
            });
            return returnReport;
        });
    };
    // Note that roomIDs is an array to allow for the case of using the apply-to-all button to save an item's data for multiple rooms at once
    Data.prototype.saveCurrentUnsavedItemData = function (userID, roomIDs, itemID) {
        var _this = this;
        if (this.currentUnsavedItemData !== null) {
            // Deep copy the current item data (data won't have function properties or Date strings so this method should be a fast/native way to deep copy)
            // See https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript answers for details
            var itemDataCopy_1 = JSON.parse(JSON.stringify(this.currentUnsavedItemData));
            // If we have a current visit already this returns immediately, otherwise it creates a visit
            return this.createNewVisitOrReturnCurrent(userID)
                .then(function () {
                // Then set the unsaved back to null so new data can be added
                _this.currentUnsavedItemData = null;
                return _this.createNewVisitData(_this.currentVisit._id, roomIDs, itemID, itemDataCopy_1)
                    .then(function (result) {
                    console.log('Saved new visit data for item ' + itemID);
                    return result;
                })
                    .catch(function (err) {
                    //return this.zone.run(() => {
                    console.error('Couldn\'t save current unsaved data');
                    // If there was a problem saving, then we can try to recover the data that didn't save yet
                    if (_this.currentUnsavedItemData !== null) {
                        __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](_this.currentUnsavedItemData, itemDataCopy_1);
                    }
                    else {
                        _this.currentUnsavedItemData = itemDataCopy_1;
                    }
                    return Promise.reject(err);
                    //});
                });
            });
        }
        else {
            return new Promise(function (resolve) {
                resolve(null);
                return false;
            });
        }
    };
    ;
    Data.prototype.createNewVisitOrReturnCurrent = function (userID) {
        var _this = this;
        if (this.currentVisit === null) {
            return this.createNewVisitAndSetCurrent(this.inspectionData._id, userID);
        }
        else {
            return new Promise(function (resolve) {
                resolve(_this.currentVisit);
                return false;
            });
        }
    };
    ;
    Data.prototype.createNewVisitAndSetCurrent = function (inspectionID, userID) {
        var newInspectionID = inspectionID.split('inspections/').join('');
        var newVisitDoc = {
            _id: 'visits/' + newInspectionID + '/' + userID + '/Visit ' + new Date().getTime(),
            type: 'Visit',
            inspectionID: inspectionID,
            userID: userID
        };
        this.currentVisit = newVisitDoc;
        return this.saveDocument(newVisitDoc)
            .then(function () {
            // Adding this part because returning the result of save doc doesn't include a .id field
            return newVisitDoc;
        });
    };
    ;
    // Note that roomIDs is an array to allow for the case of using the apply-to-all button to save an item's data for multiple rooms at once
    Data.prototype.createNewVisitData = function (visitID, roomIDs, itemID, itemObj) {
        var newVisitDataDoc = {
            _id: visitID + '/' + itemID + ' ' + new Date().getTime(),
            type: 'VisitData',
            visitID: visitID,
            data: {}
        };
        var itemParts = itemID.split('|');
        // Note this relies on the roomID being the first part of the itemID
        var justItemWithoutRoom = itemID.split(itemParts[0]).join('');
        for (var _i = 0, roomIDs_1 = roomIDs; _i < roomIDs_1.length; _i++) {
            var roomID = roomIDs_1[_i];
            var itemInRoom = roomID + justItemWithoutRoom;
            newVisitDataDoc.data[roomID] = { data: {} };
            newVisitDataDoc.data[roomID].data[itemInRoom] = itemObj;
            // In the case that apply to all is being used and we're writing multiple items to the db, we should make sure the in-memory record is updated for those other rooms too
            if (roomIDs.length > 1) {
                this.createItemStructIfNotExist(roomID, itemInRoom);
                __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](this.inspectionData.data[roomID].data[itemInRoom], itemObj);
            }
        }
        return this.saveDocument(newVisitDataDoc)
            .then(function () {
            console.log('Success creating new visit data');
            return newVisitDataDoc;
        });
    };
    ;
    Data.prototype.saveDocument = function (doc) {
        return this.db.put(doc)
            .catch(function (err) {
            console.error(err);
            return Promise.reject(err);
        });
    };
    // This is a generic function for getting a document from PouchDB
    Data.prototype.getDocument = function (docID) {
        return this.db.get(docID);
    };
    Data.prototype.resetCounts = function (unitID) {
        this.hospitalityStructure.count = 0;
        this.hospitalityStructure.sum = 0;
        this.hospitalityStructure.intPortion = '0';
        this.hospitalityStructure.remainderPortion = '.00';
        this.hospitalityStructure.unitClassification = '';
        if (!(this.dataByUnit[unitID])) {
            this.dataByUnit[unitID] = {
                roomScores: [],
                byUnitIssueStructure: {
                    // Note that _total is only used for problem keys
                    '_total': 0,
                    _flagsList: [],
                    // "_installFlagsList": [],
                    // "_replaceFlagsList": [],
                    // "_repairFlagsList": [],
                    '_keys': ['Urgent', 'Serious', 'Immediate', 'Delayed', 'Zen'],
                    '_problemKeyDict': { 'Urgent': true, 'Serious': true, 'Immediate': true },
                    '_tagCounts': {},
                    '_tagHighestArray': [],
                    'Urgent': {
                        count: 0,
                        timelineText: '< 30 days',
                        roomItemKeysObjs: []
                    },
                    'Serious': {
                        count: 0,
                        timelineText: '< 6 months',
                        roomItemKeysObjs: []
                    },
                    'Immediate': {
                        count: 0,
                        timelineText: '< 1 year',
                        roomItemKeysObjs: []
                    },
                    'Delayed': {
                        count: 0,
                        timelineText: '< 2 years',
                        roomItemKeysObjs: []
                    },
                    'Zen': {
                        count: 0,
                        timelineText: '2+ years',
                        roomItemKeysObjs: []
                    }
                }
            };
        }
        this.dataByUnit[unitID].score = 0;
        this.dataByUnit[unitID].inspectedCount = 0;
        this.dataByUnit[unitID].highestRoom = { name: '', score: 0 };
        this.dataByUnit[unitID].lowestRoom = { name: '', score: 0 };
        this.dataByUnit[unitID].lastVisitID = '';
        this.dataByUnit[unitID].roomScores.splice(0);
        this.issueStructure._total = 0;
        this.dataByUnit[unitID].byUnitIssueStructure._total = 0;
        this.issueStructure._itemsInspectedCount = 0;
        this.dataByUnit[unitID].byUnitIssueStructure._itemsInspectedCount = 0;
        this.issueStructure._flagsList = [];
        this.dataByUnit[unitID].byUnitIssueStructure._flagsList = [];
        this.issueStructure._tagCounts = {};
        this.dataByUnit[unitID].byUnitIssueStructure._tagCounts = {};
        this.issueStructure._tagHighestArray.splice(0);
        this.dataByUnit[unitID].byUnitIssueStructure._tagHighestArray.splice(0);
        for (var a = 0; a < this.numberOfTagsForSummary; a++) {
            this.issueStructure._tagHighestArray.push('');
            this.dataByUnit[unitID].byUnitIssueStructure._tagHighestArray.push('');
        }
        this.issueStructure._tagCounts[''] = 0;
        this.dataByUnit[unitID].byUnitIssueStructure._tagCounts[''] = 0;
        for (var _i = 0, _a = this.issueStructure._keys; _i < _a.length; _i++) {
            var id = _a[_i];
            this.issueStructure[id].count = 0;
            this.dataByUnit[unitID].byUnitIssueStructure[id].count = 0;
            this.issueStructure[id].roomItemKeysObjs.splice(0);
            this.dataByUnit[unitID].byUnitIssueStructure[id].roomItemKeysObjs.splice(0);
        }
    };
    Data.prototype.getColorStringByRating = function (rating) {
        if (rating <= 3.33) {
            return 'rgba(254, 0, 0, 1)';
        }
        else if (rating >= 6.67) {
            return 'rgba(0, 254, 0, 1)';
        }
        else {
            return 'rgba(0, 0, 254, 1)';
        }
    };
    Data.prototype.updateTagCounts = function (tagName, tagCounts, tagHighestArray) {
        if (typeof (tagCounts[tagName]) === 'undefined') {
            tagCounts[tagName] = 1;
        }
        else {
            (tagCounts[tagName])++;
        }
        // Now we need to check if this current tag's new count is higher
        // then our previous maximum (and move the previous maximums)
        if (tagName !== tagHighestArray[0]) {
            if (tagCounts[tagName] >= tagCounts[tagHighestArray[0]]) {
                var indexOfTagName = tagHighestArray.indexOf(tagName);
                // If the tagname is already in the array, then we start our
                // overwrite procedure at that index in the array.
                // But if it isn't in the list then our index starts at the end
                if (indexOfTagName === -1) {
                    indexOfTagName = tagHighestArray.length - 1;
                }
                for (var a = indexOfTagName; a > 0; a--) {
                    tagHighestArray[a] = tagHighestArray[a - 1];
                }
                tagHighestArray[0] = tagName;
            }
        }
    };
    // If there isn't previous visit data for an item, will create structures for it in inspectionData to collect new input
    Data.prototype.createItemStructIfNotExist = function (roomID, itemID) {
        if (typeof (this.inspectionData.data[roomID]) === 'undefined') {
            this.inspectionData.data[roomID] = { data: {} };
        }
        if (!this.roomStructure[roomID]) {
            this.roomStructure[roomID] = {};
        }
        if (!this.roomStructure[roomID].data) {
            this.roomStructure[roomID].data = this.createFreshRoomObj(roomID);
        }
        if (typeof (this.roomStructure[roomID].data.itemsObj) === 'undefined') {
            this.roomStructure[roomID].data.itemsObj = {};
        }
        if (typeof (this.roomStructure[roomID].data.itemsObj[itemID]) === 'undefined') {
            this.roomStructure[roomID].data.itemsObj[itemID] = {};
            this.roomStructure[roomID].data.itemsObj[itemID].imageKeys = [];
        }
        if (typeof (this.roomStructure[roomID].data.itemsObj[itemID].imageKeys) === 'undefined') {
            this.roomStructure[roomID].data.itemsObj[itemID].imageKeys = [];
        }
        if (typeof (this.inspectionData.data[roomID].data[itemID]) === 'undefined') {
            this.inspectionData.data[roomID].data[itemID] = {};
            var templateItem = this.inspectionTemplate.data[roomID].data[itemID];
            __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](this.inspectionData.data[roomID].data[itemID], templateItem);
        }
        if (typeof (this.inspectionData.data[roomID].data[itemID]['images']) === 'undefined') {
            this.inspectionData.data[roomID].data[itemID]['images'] = {};
        }
        if (typeof (this.inspectionData.data[roomID].data[itemID]['naChoice']) === 'undefined') {
            this.inspectionData.data[roomID].data[itemID]['naChoice'] = false;
        }
        if (typeof (this.inspectionData.data[roomID].data[itemID]['mergedComments']) === 'undefined') {
            this.inspectionData.data[roomID].data[itemID]['mergedComments'] = '';
        }
        if (typeof (this.inspectionData.data[roomID].data[itemID]['inspectionWorkTrackingConditions']) === 'undefined') {
            this.inspectionData.data[roomID].data[itemID]['inspectionWorkTrackingConditions'] = {};
            var templateData = this.inspectionTemplate.data[roomID].data[itemID]['inspectionWorkTrackingConditions'];
            __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](this.inspectionData.data[roomID].data[itemID]['inspectionWorkTrackingConditions'], templateData);
        }
        if (typeof (this.inspectionData.data[roomID].data[itemID]['typesConditions']) === 'undefined') {
            this.inspectionData.data[roomID].data[itemID]['typesConditions'] = {};
            var templateData = this.inspectionTemplate.data[roomID].data[itemID]['typesConditions'];
            __WEBPACK_IMPORTED_MODULE_3_lodash__["merge"](this.inspectionData.data[roomID].data[itemID]['typesConditions'], templateData);
        }
    };
    Data.prototype.createFreshRoomObj = function (roomID) {
        var roomObj = {
            _id: roomID,
            itemList: [],
            issueCount: 0,
            flagsList: [],
            // installFlagsList: [],
            // replaceFlagsList: [],
            // repairFlagsList: [],
            completedItemCount: 0,
            commentCount: 0,
            hospitalityCount: 0,
            hospitalitySum: 0,
            hospitalityInt: '0',
            hospitalityRemainder: '.00',
            chartColors: [],
            tagCounts: {},
            tagHighestArray: [],
            itemPicObjs: [],
            itemsObj: {},
            issueTypeCounts: {}
        };
        for (var a = 0; a < this.numberOfTagsForSummary; a++) {
            roomObj.tagHighestArray.push('');
        }
        for (var _i = 0, _a = this.issueStructure['_keys']; _i < _a.length; _i++) {
            var issueKey = _a[_i];
            roomObj.issueTypeCounts[issueKey] = 0;
        }
        roomObj.tagCounts[''] = 0;
        return roomObj;
    };
    // This function parses the inspectionData and creates a roomList for the UI
    Data.prototype.setupRoomStructure = function (unitID, inMemoryInspData) {
        this.resetCounts(unitID);
        var thisUnitScoreSum = 0;
        var thisUnitScoreCount = 0;
        var thisUnitInspectedCount = 0;
        for (var roomID in inMemoryInspData) {
            var roomObj = this.createFreshRoomObj(roomID);
            for (var itemID in inMemoryInspData[roomID].data) {
                var inputItemObj = inMemoryInspData[roomID].data[itemID];
                var itemObj = {
                    _id: itemID,
                    item: inputItemObj,
                    typeConditionKeys: [],
                    commentKeys: [],
                    imageKeys: []
                };
                if (inputItemObj.reportFlag) {
                    var itemParts = itemID.split('|');
                    // Note this relies on the item name being the last part of the itemID
                    var justItemName = itemParts[itemParts.length - 1];
                    roomObj.flagsList.push(justItemName);
                    // roomObj.replaceFlagsList.push(justItemName);
                    // roomObj.installFlagsList.push(justItemName);
                    // roomObj.repairFlagsList.push(justItemName);
                    this.issueStructure._flagsList.push(itemID);
                    this.dataByUnit[unitID].byUnitIssueStructure._flagsList.push(itemID);
                }
                if (inputItemObj.typesConditions) {
                    for (var _i = 0, _a = Object.keys(inputItemObj.typesConditions); _i < _a.length; _i++) {
                        var typeConditionKey = _a[_i];
                        var theseOptionKeys = Object.keys(inputItemObj.typesConditions[typeConditionKey]);
                        var typeConditionObj = {
                            _id: typeConditionKey,
                            optionKeys: theseOptionKeys
                        };
                        // Right now we just check if the template is already loaded
                        // But it would be smoother if we would just wait for the template
                        // in the case where it hasn't finished loading
                        if (this.inspectionTemplate.typesConditions) {
                            for (var _b = 0, theseOptionKeys_1 = theseOptionKeys; _b < theseOptionKeys_1.length; _b++) {
                                var thisOptionKey = theseOptionKeys_1[_b];
                                var option = this.getOptionTemplateFromID(typeConditionKey, thisOptionKey);
                                if (option) {
                                    var tagName = option.optionName;
                                    if (inputItemObj.typesConditions[typeConditionKey][thisOptionKey].textValue) {
                                        tagName += ': ' + inputItemObj.typesConditions[typeConditionKey][thisOptionKey].textValue;
                                    }
                                    if (typeof (this.dataByUnit[unitID].byUnitIssueStructure._tagCounts[tagName]) === 'undefined') {
                                        this.dataByUnit[unitID].byUnitIssueStructure._tagCounts[tagName] = 1;
                                    }
                                    else {
                                        (this.dataByUnit[unitID].byUnitIssueStructure._tagCounts[tagName])++;
                                    }
                                    if (typeof (this.issueStructure._tagCounts[tagName]) === 'undefined') {
                                        this.issueStructure._tagCounts[tagName] = 1;
                                    }
                                    else {
                                        (this.issueStructure._tagCounts[tagName])++;
                                    }
                                    // Update the tag counts for this room
                                    this.updateTagCounts(tagName, roomObj.tagCounts, roomObj.tagHighestArray);
                                    // Update the tag counts for the overall inspection
                                    this.updateTagCounts(tagName, this.issueStructure._tagCounts, this.issueStructure._tagHighestArray);
                                    // Update the safe structure
                                    this.updateTagCounts(tagName, this.dataByUnit[unitID].byUnitIssueStructure._tagCounts, this.dataByUnit[unitID].byUnitIssueStructure._tagHighestArray);
                                }
                            }
                        }
                        itemObj.typeConditionKeys.push(typeConditionObj);
                    }
                }
                if (inputItemObj.mergedComments) {
                    roomObj.commentCount++;
                }
                else {
                    // We only check for comments if mergedComments doesn't exist
                    if (inputItemObj.comments) {
                        itemObj.commentKeys = Object.keys(inputItemObj.comments);
                        roomObj.commentCount += itemObj.commentKeys.length;
                        if (typeof (inputItemObj.mergedComments) === 'undefined') {
                            inputItemObj.mergedComments = '';
                            for (var commentKey in inputItemObj.comments) {
                                inputItemObj.mergedComments += inputItemObj.comments[commentKey].text + '\n';
                            }
                        }
                    }
                }
                if (inputItemObj.images) {
                    itemObj.imageKeys = Object.keys(inputItemObj.images);
                    for (var _c = 0, _d = itemObj.imageKeys; _c < _d.length; _c++) {
                        var imageID = _d[_c];
                        /*if (inputItemObj.images[imageID].src) {
                          let imageObj = inputItemObj.images[imageID];
                          let data = imageObj.src.split('www.dropbox.com').join('dl.dropboxusercontent.com');
                          // This would be a quick/dirty way to handle the resizing.
                          // Downsides: slow to convert / uses lots of memory to hold thumbnails
                          var loadingImage = (window as any).loadImage(data, function (img) {
                            imageObj.src = img.toDataURL();
                            return imageObj;
                          },{
                            maxWidth: 400,
                            orientation: true
                          });
                          if (!loadingImage) {
                            console.error('No image loading library');
                          }
                        }*/
                        var itemPicObj = {
                            itemID: itemID,
                            picID: imageID
                        };
                        roomObj.itemPicObjs.push(itemPicObj);
                    }
                }
                if (inputItemObj.hospitalityRating) {
                    var hospIntVal = parseInt(inputItemObj.hospitalityRating);
                    // Just discovered that sometimes the inputItemObj has hospitalityRating set to a string 'undefined', so make sure our parsed result is really a number
                    if (!(isNaN(hospIntVal))) {
                        if (inputItemObj.markSectionComplete && !inputItemObj.naChoice) {
                            roomObj.hospitalityCount++;
                            roomObj.hospitalitySum += hospIntVal;
                            this.hospitalityStructure.count++;
                            this.hospitalityStructure.sum += hospIntVal;
                            thisUnitScoreCount++;
                            thisUnitScoreSum += hospIntVal;
                        }
                    }
                }
                if (inputItemObj.markSectionComplete && !inputItemObj.naChoice) {
                    roomObj.completedItemCount++;
                }
                var putAtTop = false;
                // We want issues to be listed at the top
                // So if it is an issue we will use unshift to add to the front
                // Else it is added to the back (and items without a work tracking condition will be put at the back)
                if (inputItemObj.inspectionWorkTrackingConditions && inputItemObj.inspectionWorkTrackingConditions.selection) {
                    if (inputItemObj.markSectionComplete && !inputItemObj.naChoice) {
                        this.issueStructure._itemsInspectedCount++;
                        this.dataByUnit[unitID].byUnitIssueStructure._itemsInspectedCount++;
                        thisUnitInspectedCount++;
                    }
                    // All selection types should be in the issue struct now
                    if (this.issueStructure[inputItemObj.inspectionWorkTrackingConditions.selection]) {
                        var roomItemKeysObj = {
                            roomID: roomID,
                            itemID: itemID,
                            typeConditionKeys: [],
                            commentKeys: [],
                            imageKeys: []
                        };
                        if (inputItemObj.comments) {
                            roomItemKeysObj.commentKeys = itemObj.commentKeys;
                        }
                        if (inputItemObj.images) {
                            roomItemKeysObj.imageKeys = itemObj.imageKeys;
                        }
                        if (inputItemObj.typesConditions) {
                            roomItemKeysObj.typeConditionKeys = itemObj.typeConditionKeys;
                        }
                        this.issueStructure[inputItemObj.inspectionWorkTrackingConditions.selection].roomItemKeysObjs.push(roomItemKeysObj);
                        if (inputItemObj.markSectionComplete && !inputItemObj.naChoice) {
                            this.issueStructure[inputItemObj.inspectionWorkTrackingConditions.selection].count++;
                            this.dataByUnit[unitID].byUnitIssueStructure[inputItemObj.inspectionWorkTrackingConditions.selection].count++;
                            roomObj.issueTypeCounts[inputItemObj.inspectionWorkTrackingConditions.selection]++;
                        }
                        if (this.issueStructure['_problemKeyDict'][inputItemObj.inspectionWorkTrackingConditions.selection]) {
                            // We set put at top because the item needs to be unshifted
                            putAtTop = true;
                            if (inputItemObj.markSectionComplete && !inputItemObj.naChoice) {
                                roomObj.issueCount++;
                                this.issueStructure['_total']++;
                                this.dataByUnit[unitID].byUnitIssueStructure['_total']++;
                            }
                        }
                    }
                }
                roomObj.itemsObj[itemObj._id] = itemObj;
                if (putAtTop) {
                    roomObj.itemList.unshift(itemObj);
                }
                else {
                    roomObj.itemList.push(itemObj);
                }
            }
            // Finish roomObj setup
            var roomScore = roomObj.hospitalitySum / roomObj.hospitalityCount;
            if (roomObj.hospitalityCount > 0) {
                roomObj.hospitalityInt = (Math.floor(roomScore)).toString();
                roomObj.hospitalityRemainder = ((roomScore) % 1).toFixed(2).substring(1);
                var roomName = roomID;
                if (this.inspectionTemplate.roomAliases && this.inspectionTemplate.roomAliases[roomID]) {
                    roomName = this.inspectionTemplate.roomAliases[roomID];
                }
                this.dataByUnit[unitID].roomScores.push({ name: roomName, score: roomScore });
            }
            var roomChartColor = this.getColorStringByRating(roomScore);
            roomObj.chartColors = [{
                    backgroundColor: [
                        roomChartColor,
                        'rgba(221, 221, 221, 1)'
                    ],
                    borderColor: [
                        roomChartColor,
                        'rgba(221, 221, 221, 1)'
                    ]
                }];
            if (typeof (this.roomStructure[roomObj._id]) === 'undefined') {
                this.roomStructure[roomObj._id] = {};
            }
            this.roomStructure[roomObj._id].data = roomObj;
        }
        this.dataByUnit[unitID].roomScores.sort(function (a, b) { return a.score - b.score; });
        var overallScore = this.hospitalityStructure.sum / this.hospitalityStructure.count;
        if (thisUnitScoreCount) {
            this.dataByUnit[unitID].score = thisUnitScoreSum / thisUnitScoreCount;
        }
        this.dataByUnit[unitID].inspectedCount = thisUnitInspectedCount;
        this.setHospStructureClassificationAndScores(overallScore);
        var chartColor = this.getColorStringByRating(overallScore);
        this.hospitalityStructure.chartColors = [{
                backgroundColor: [
                    chartColor,
                    'rgba(221, 221, 221, 1)'
                ],
                borderColor: [
                    chartColor,
                    'rgba(221, 221, 221, 1)'
                ]
            }];
        this.setHighestLowest();
    };
    Data.prototype.setHospStructureClassificationAndScores = function (overallScore) {
        if (this.hospitalityStructure.count > 0) {
            this.hospitalityStructure.intPortion = (Math.floor(overallScore)).toString();
            this.hospitalityStructure.remainderPortion = ((overallScore) % 1).toFixed(2).substring(1);
            if (overallScore >= 8) {
                this.hospitalityStructure.unitClassification = 'Luxury';
            }
            else if (overallScore >= 6) {
                this.hospitalityStructure.unitClassification = 'Deluxe';
            }
            else if (overallScore >= 4) {
                this.hospitalityStructure.unitClassification = 'Standard';
            }
            else if (overallScore <= 3) {
                this.hospitalityStructure.unitClassification = 'Budget';
            }
        }
        else {
            this.hospitalityStructure.unitClassification = 'NA';
        }
    };
    Data.prototype.setHighestLowest = function () {
        var _this = this;
        var temp = [];
        var roomIDs = Object.keys(this.roomStructure);
        // console.log(roomIDs);
        roomIDs.forEach(function (roomID) {
            var room = _this.roomStructure[roomID].data;
            if (room.hospitalityCount) {
                temp.push({ name: room._id, score: (room.hospitalitySum / room.hospitalityCount) });
            }
        });
        // console.log(temp);
        temp.sort(function (a, b) { return a.score - b.score; });
        this.sortedHospRatings = temp;
        // console.log(this.sortedHospRatings);
    };
    Data.prototype.recalculateRoomScore = function (roomID, oldScore, newScore) {
        var oldHospIntVal = parseInt(oldScore);
        var newHospIntVal = parseInt(newScore);
        if (!this.roomStructure[roomID].data.hospitalitySum) {
            this.roomStructure[roomID].data = this.createFreshRoomObj(roomID);
        }
        var roomObj = this.roomStructure[roomID].data;
        // Sometimes the inputItemObj has hospitalityRating set to a string
        // 'undefined', so make sure our parsed result is really a number
        if (!(isNaN(newHospIntVal))) {
            if (!(isNaN(oldHospIntVal))) {
                // If there was an old value, subtract it from the sums before adding the new
                roomObj.hospitalitySum -= oldHospIntVal;
                roomObj.hospitalitySum += newHospIntVal;
                this.hospitalityStructure.sum -= oldHospIntVal;
                this.hospitalityStructure.sum += newHospIntVal;
            }
            else {
                // In this case there is no old value, need to add the new val to count and sum
                roomObj.hospitalityCount++;
                roomObj.hospitalitySum += newHospIntVal;
                this.hospitalityStructure.count++;
                this.hospitalityStructure.sum += newHospIntVal;
            }
            var roomScore = 0;
            if (roomObj.hospitalityCount) {
                // Finally recalculate the int/remainder portions and set the highest/lowest
                roomScore = roomObj.hospitalitySum / roomObj.hospitalityCount;
                roomObj.hospitalityInt = (Math.floor(roomScore)).toString();
                roomObj.hospitalityRemainder = ((roomScore) % 1).toFixed(2).substring(1);
                var overallScore = this.hospitalityStructure.sum / this.hospitalityStructure.count;
                this.setHospStructureClassificationAndScores(overallScore);
                this.setHighestLowest();
            }
        }
    };
    Data.prototype.recalculateTimelineCounts = function (roomID, oldTimeline, newTimeline) {
        if (!this.roomStructure[roomID].data.issueTypeCounts) {
            this.roomStructure[roomID].data = this.createFreshRoomObj(roomID);
        }
        var roomObj = this.roomStructure[roomID].data;
        console.log('Need to add code here to recalculate total inspections etc');
        // Update each rooms inspected item counts, update overall item counts,
        // and update the counts for timelineValues (like Serious/Zen etc)
        if (!oldTimeline || (oldTimeline === '')) {
            // This means there was no previous timelineValue, so add one to total
            this.issueStructure._itemsInspectedCount++;
            if (!this.roomStructure[roomID].data.completedItemCount) {
                this.roomStructure[roomID].data.completedItemCount = 0;
            }
            this.roomStructure[roomID].data.completedItemCount++;
        }
        else {
            // This means there was an old timelineValue, so no need to increment total
            // Just reduce the count in the old value stores
            this.issueStructure[oldTimeline].count--;
            roomObj.issueTypeCounts[oldTimeline]--;
        }
        if (newTimeline) {
            // Then in both cases we will increment the new value
            this.issueStructure[newTimeline].count++;
            if (!roomObj.issueTypeCounts[newTimeline]) {
                roomObj.issueTypeCounts[newTimeline] = 0;
            }
            roomObj.issueTypeCounts[newTimeline]++;
        }
    };
    Data.prototype.setRoomOrderDefault = function () {
        this.inspectionTemplate.roomOrder = this.defaultRoomOrder;
    };
    return Data;
}());
Data = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_4__dropbox_dropbox__["a" /* DropboxProvider */], __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["c" /* DomSanitizer */]])
], Data);

//# sourceMappingURL=data.js.map

/***/ }),

/***/ 152:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ReportCreatorPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(259);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ng2_charts__ = __webpack_require__(288);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ng2_charts___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_ng2_charts__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__reportlist_reportlist__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__print_print__ = __webpack_require__(407);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__popoverinsdate_popoverinsdate__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__providers_auth_service__ = __webpack_require__(28);
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};










var ReportCreatorPage = (function () {
    function ReportCreatorPage(navCtrl, popoverCtrl, navParams, dataProvider, /*private cdRef: ChangeDetectorRef,*/ toast, auth) {
        this.navCtrl = navCtrl;
        this.popoverCtrl = popoverCtrl;
        this.navParams = navParams;
        this.dataProvider = dataProvider;
        this.toast = toast;
        this.auth = auth;
        // In case the page is opened without a unit provided to the router
        this.unit = {
            _id: '',
            name: ''
        };
        this.doughnutChartSettings = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "75",
                aspectRatio: 1
            }
        };
        this.ownerReport = { roomObjList: [], projObjList: [], victoriesList: [], failuresList: [] };
        this.prevOwnerReport = {};
        this.roomList = [];
        this.showSavePopup = false;
        this.reportFlags = {};
    }
    ReportCreatorPage.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.doneLoading = false;
        var unit = this.navParams.get('unit');
        if ((typeof (unit) !== 'undefined') && (typeof (unit._id) !== 'undefined')) {
            this.unit = unit;
        }
        // Note that the code to load the owner report from the db has to come after reset builder (see below) because it relies on the empty
        // structure of the report room list already existing
        this.resetBuilder();
        var navToRoomID = this.navParams.get('roomID');
        if (typeof (navToRoomID) !== 'undefined') {
            this.roomID = navToRoomID;
            if (this.roomID === 'PROJECTS') {
                this.selectedRoomIndex = this.roomList.length - 1;
                console.log('going to projects');
                this.roomList.forEach(function (room, index) {
                    _this.completedIndices[index] = true;
                });
            }
        }
        else {
            this.roomID = this.roomList[0];
        }
        var ownerReport = this.navParams.get('ownerReport');
        if ((typeof (ownerReport) !== 'undefined') && (ownerReport !== null)) {
            this.ownerReport = ownerReport;
            if (this.ownerReport.roomObjList[this.selectedRoomIndex]) {
                this.selectedPictures = this.ownerReport.roomObjList[this.selectedRoomIndex].selectedPicObjs;
            }
            this.doneLoading = true;
        }
        else {
            // Note that this code (load the owner report) has to come after reset builder (see above) because it relies on the empty
            // structure of the report room list already existing
            // In the case that a report object isn't already in memory - read from the db and parse the objects into arrays and properties
            this.dataProvider.getOwnerReport(this.dataProvider.inspectionData._id)
                .then(function (reportObjFromDB) {
                // This handles the report's per-room data (room summary and pictures)
                // You can see here how the load code relies on the report structure already being in place (created by resetbuilder)
                _this.ownerReport.roomObjList.forEach(function (roomObj, roomIndex) {
                    var roomID = roomObj.name;
                    if (_this.dataProvider.roomStructure[roomID] && _this.dataProvider.roomStructure[roomID].data) {
                        if (reportObjFromDB[roomID]) {
                            // Handle each room summary
                            if (reportObjFromDB[roomID].summary) {
                                _this.ownerReport.roomObjList[roomIndex].summary = reportObjFromDB[roomID].summary;
                            }
                            // Handle the pictures for each room
                            if (reportObjFromDB[roomID].picsObjDict) {
                                var picIDs = Object.keys(reportObjFromDB[roomID].picsObjDict);
                                var picLength = picIDs.length;
                                if (picLength) {
                                    _this.ownerReport.roomObjList[roomIndex].selectedPicObjs.splice(0);
                                }
                                for (var index = 0; index < picLength; index++) {
                                    var thisPic = reportObjFromDB[roomID].picsObjDict[picIDs[index]];
                                    _this.ownerReport.roomObjList[roomIndex].selectedPicObjs.push(thisPic);
                                }
                            }
                        }
                    }
                });
                // Then set the local selected pics based on the loaded report
                if (_this.ownerReport.roomObjList[_this.selectedRoomIndex]) {
                    _this.selectedPictures = _this.ownerReport.roomObjList[_this.selectedRoomIndex].selectedPicObjs;
                }
                // This handles the overall summary
                if (reportObjFromDB.unitSummary) {
                    _this.ownerReport.unitSummary = reportObjFromDB.unitSummary;
                }
                // Handle the victory list
                if (reportObjFromDB['victoryObjDict']) {
                    var victIDs = Object.keys(reportObjFromDB['victoryObjDict']);
                    var victLength = victIDs.length;
                    if (victLength) {
                        _this.ownerReport.victoriesList.splice(0);
                    }
                    for (var index = 0; index < victLength; index++) {
                        var thisVict = reportObjFromDB['victoryObjDict'][victIDs[index]];
                        _this.ownerReport.victoriesList.push(thisVict);
                    }
                }
                // Handle the failure list
                if (reportObjFromDB['failureObjDict']) {
                    var failIDs = Object.keys(reportObjFromDB['failureObjDict']);
                    var failLength = failIDs.length;
                    if (failLength) {
                        _this.ownerReport.failuresList.splice(0);
                    }
                    for (var index = 0; index < failLength; index++) {
                        var thisFail = reportObjFromDB['failureObjDict'][failIDs[index]];
                        _this.ownerReport.failuresList.push(thisFail);
                    }
                }
                // Handle the project list
                if (reportObjFromDB['projObjDict']) {
                    var projIDs = Object.keys(reportObjFromDB['projObjDict']);
                    var projLength = projIDs.length;
                    if (projLength) {
                        _this.ownerReport.projObjList.splice(0);
                    }
                    for (var index = 0; index < projLength; index++) {
                        var thisProj = reportObjFromDB['projObjDict'][projIDs[index]];
                        _this.ownerReport.projObjList.push(thisProj);
                    }
                }
                _this.prevOwnerReport = JSON.parse(JSON.stringify(reportObjFromDB));
                _this.doneLoading = true;
            })
                .catch(function () {
                _this.doneLoading = true;
            });
        }
    };
    ReportCreatorPage.prototype.resetBuilder = function () {
        var timestampNow = new Date().getTime();
        this.ownerReport.unitName = this.unit.name;
        this.ownerReport.unitSummary = '';
        this.prevOwnerReport = {};
        this.ownerReport.roomObjList.splice(0);
        this.ownerReport.projObjList.splice(0);
        this.ownerReport.projObjList.push({
            description: '',
            estimate: { lower: 0, upper: 25000 },
            _id: timestampNow,
            removeMe: false
        });
        this.ownerReport.victoriesList.splice(0);
        this.ownerReport.victoriesList.push({ text: '', _id: timestampNow, removeMe: false });
        this.ownerReport.failuresList.splice(0);
        this.ownerReport.failuresList.push({ text: '', _id: timestampNow, removeMe: false });
        this.selectedRoomIndex = 0;
        this.completedIndices = {};
        this.selectedPictures = [];
        this.roomList.splice(0);
        for (var _i = 0, _a = this.dataProvider.inspectionTemplate.roomOrder; _i < _a.length; _i++) {
            var room = _a[_i];
            if (this.dataProvider.roomStructure[room] && this.dataProvider.roomStructure[room].data) {
                var roomObj = { name: room, summary: '', selectedPicObjs: [] };
                this.roomList.push(room);
                this.ownerReport.roomObjList.push(roomObj);
            }
        }
        this.roomList.push('UNIT SUMMARY');
        this.roomList.push('PROJECTS');
    };
    ReportCreatorPage.prototype.sliderOnChange = function (event) {
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.addEmptyVictory = function () {
        this.ownerReport.victoriesList.push({ text: '', _id: new Date().getTime(), removeMe: false });
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.removeVictory = function (index) {
        this.ownerReport.victoriesList[index].removeMe = true;
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.addEmptyFailure = function () {
        this.ownerReport.failuresList.push({ text: '', _id: new Date().getTime(), removeMe: false });
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.removeFailure = function (index) {
        this.ownerReport.failuresList[index].removeMe = true;
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.addNewProject = function () {
        this.ownerReport.projObjList.push({
            description: '',
            estimate: { lower: 0, upper: 25000 },
            _id: new Date().getTime(),
            removeMe: false
        });
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.removeProject = function (index) {
        this.ownerReport.projObjList[index].removeMe = true;
        //this.cdRef.detectChanges();
    };
    /**
     * Allows pictures to be added and removed on click.
     * Pictures are stored in this.selectedPictures.
     * When pictures are removed their comments are wiped out.
     * @param pic
     */
    ReportCreatorPage.prototype.togglePicture = function (pic) {
        var index = -1;
        for (var i = 0; i < this.selectedPictures.length; i++) {
            if (this.selectedPictures[i]._id === pic._id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            // Right now we need to push a copy because we're using pic objects across rooms.
            // Since the demo pic objs are reused, can't use refs because comments persist.
            // With real data connected then I think we'll be able to go back to just refs.
            var picCopy = __assign({}, pic);
            picCopy.removeMe = false;
            this.selectedPictures.push(picCopy);
        }
        else {
            // Handle the case of finding the pic but that it was previously removed
            if (this.selectedPictures[index].removeMe) {
                this.selectedPictures[index].removeMe = false;
            }
            else {
                this.selectedPictures[index].removeMe = true;
            }
        }
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.pictureExists = function (pic) {
        for (var i = 0; i < this.selectedPictures.length; i++) {
            if ((this.selectedPictures[i]._id === pic._id) && (!this.selectedPictures[i].removeMe)) {
                return true;
            }
        }
        return false;
    };
    ReportCreatorPage.prototype.showReportPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__reportlist_reportlist__["a" /* ReportListPage */], { unit: this.unit, ownerReport: this.ownerReport }, { animate: true, direction: 'backward' });
    };
    ReportCreatorPage.prototype.invokeSavePopup = function (roomIndex) {
        var _this = this;
        var roomID = this.roomList[roomIndex];
        var toast = this.toast.create({
            message: roomID + ' was saved',
            duration: 3000,
            position: 'top',
        });
        this.dataProvider.saveOwnerReport(this.ownerReport, this.prevOwnerReport, this.dataProvider.inspectionData, this.auth.currentUser.username, roomID)
            .then(function (resultDoc) {
            __WEBPACK_IMPORTED_MODULE_0_lodash__["merge"](_this.prevOwnerReport, resultDoc.reportDataDict);
            toast.present();
        });
    };
    ReportCreatorPage.prototype.clickIndex = function (roomIndex) {
        var _this = this;
        // Need to check this because unit summary / project aren't rooms in report-output
        if (typeof (this.ownerReport.roomObjList[this.selectedRoomIndex]) !== 'undefined') {
            this.ownerReport.roomObjList[this.selectedRoomIndex].selectedPicObjs = this.selectedPictures.slice();
        }
        // Have to call invoke save after the owner report pictures are copied above
        this.invokeSavePopup(this.selectedRoomIndex);
        this.completedIndices[this.selectedRoomIndex] = true;
        this.roomID = this.roomList[roomIndex];
        this.doneLoading = false;
        this.selectedRoomIndex = roomIndex;
        this.doneLoading = true;
        if (this.roomList[roomIndex] !== 'UNIT SUMMARY' && this.roomList[roomIndex] !== 'PROJECTS') {
            // Load previously selected pictures from the report-output into the builder
            this.selectedPictures = this.ownerReport.roomObjList[this.selectedRoomIndex].selectedPicObjs;
            if (this.slides) {
                this.slides.slideTo(0, 0);
            }
            // We have the refresh the whole donut chart to see color changes (red, blue, or green depending on score).
            // Not sure why setTimeout is used but allegedly required: https://github.com/valor-software/ng2-charts/issues/547
            setTimeout(function () {
                _this._chart.refresh();
                //this.cdRef.detectChanges();
            }, 0);
        }
        //this.cdRef.detectChanges();
    };
    ReportCreatorPage.prototype.openPopover = function (myEvent) {
        var popover = this.popoverCtrl.create(__WEBPACK_IMPORTED_MODULE_6__popoverinsdate_popoverinsdate__["a" /* PopoverinsdatePage */]);
        popover.present({
            ev: myEvent
        });
    };
    ReportCreatorPage.prototype.showPrintPage = function () {
        this.invokeSavePopup(this.selectedRoomIndex);
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_5__print_print__["a" /* PrintPage */], { ownerReport: this.ownerReport, unit: this.unit }, {
            animate: true,
            direction: 'forward'
        });
    };
    ReportCreatorPage.prototype.showPrintWithoutSave = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_5__print_print__["a" /* PrintPage */], { ownerReport: this.ownerReport, unit: this.unit }, {
            animate: true,
            direction: 'forward'
        });
    };
    return ReportCreatorPage;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_2_ng2_charts__["BaseChartDirective"]),
    __metadata("design:type", Object)
], ReportCreatorPage.prototype, "_chart", void 0);
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["l" /* Slides */]),
    __metadata("design:type", __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["l" /* Slides */])
], ReportCreatorPage.prototype, "slides", void 0);
ReportCreatorPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["Component"])({
        selector: 'page-reportcreator',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/reportcreator/reportcreator.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title><img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile"></ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid *ngIf="doneLoading">\n    <ion-row class="page-nav">\n      <ion-col>\n          <a (click)="showReportPage()" class="clickable-element">\n            <p class="negative-margin"><ion-icon name="arrow-back"></ion-icon> Data Details </p></a>\n        <h2 class="page-header">{{unit.name}}\n        </h2>\n          <p class="negative-margin">Template for unit</p>\n      </ion-col>\n    </ion-row>\n    <ion-row class="label-fix" >\n      <!-- left column room list -->\n      <ion-col col-12 col-md-3 class="inspection-nav">\n        <ion-list *ngIf="roomList.length" class="report-builder">\n          <ng-container *ngFor="let room of roomList; let i = index;">\n            <p\n              *ngIf="(room === \'UNIT SUMMARY\')||(room === \'PROJECTS\')||(dataProvider.roomStructure[room] && dataProvider.roomStructure[room].data)"\n              [ngClass]="{\'completed\': completedIndices[i], \'current\': i==selectedRoomIndex}"\n              [attr.color]="completedIndices[i] ? \'secondary\' : null"\n              (click)="clickIndex(i)">\n              <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[room]">\n                <ion-icon *ngIf="completedIndices[i]"\n                        name="checkmark-circle"></ion-icon> {{dataProvider.inspectionTemplate.roomAliases[room]}}\n              </span>\n              <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[room]">\n                <ion-icon *ngIf="completedIndices[i]"\n                        name="checkmark-circle"></ion-icon> {{room}}\n              </span>\n            </p>\n          </ng-container>\n          <p (click)="showPrintWithoutSave()">\n            PRINT REPORT\n          </p>\n        </ion-list>\n      </ion-col>\n\n      <!-- section for ROOM VIEW -->\n      <ion-col *ngIf="(roomID !== \'UNIT SUMMARY\')&&(roomID !== \'PROJECTS\')" col-12 col-md-5 offset-md-1>\n        <h2 class="page-header">\n          <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[roomList[selectedRoomIndex]]">\n            {{dataProvider.inspectionTemplate.roomAliases[roomList[selectedRoomIndex]]}}\n          </span>\n          <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[roomList[selectedRoomIndex]]">\n            {{roomList[selectedRoomIndex]}}\n          </span>\n        </h2>\n        <ng-container *ngIf="dataProvider.roomStructure[roomID]?.data?.flagsList.length > 0">\n          <ion-icon name="flag" style="color:red;"></ion-icon>\n          {{dataProvider.roomStructure[roomID].data.flagsList.join(\', \')}}\n        </ng-container>\n        <ion-label class="section-header">Room Summary</ion-label>\n        <ion-textarea type="text" [(ngModel)]="ownerReport.roomObjList[selectedRoomIndex].summary"></ion-textarea>\n\n        <ion-label class="section-header" >Add a picture to report</ion-label>\n        <ion-slides *ngIf="dataProvider.roomStructure[roomID]?.data?.itemPicObjs.length" pager slidesPerView="3" spaceBetween="5px">\n          <ng-container *ngFor="let itemPicObj of dataProvider.roomStructure[roomID].data.itemPicObjs">\n            <ion-slide *ngIf="dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID].thumb400"\n                       [ngClass]="{\'selected\': pictureExists(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID])}">\n              <span (click)="togglePicture(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID])"\n                     class="clickable-element">\n                <ion-icon *ngIf="pictureExists(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID])"\n                          name="checkmark-circle"></ion-icon>\n                <img width="100%" height="auto"\n                    [src]="dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID].thumb400"/>\n              </span>\n            </ion-slide>\n            <ion-slide *ngIf="!(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID].thumb400) && dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID].localOrigURI"\n                       [ngClass]="{\'selected\': pictureExists(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID])}">\n              <span (click)="togglePicture(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID])"\n                     class="clickable-element">\n                <ion-icon *ngIf="pictureExists(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID])"\n                          name="checkmark-circle"></ion-icon>\n                <img width="100%" height="auto"\n                    [src]="dataProvider.fileURIasSrc(dataProvider.inspectionData.data[roomID].data[itemPicObj.itemID].images[itemPicObj.picID].localOrigURI)"/>\n              </span>\n            </ion-slide>\n          </ng-container>\n        </ion-slides>\n        <div *ngIf="selectedPictures.length">\n          <ng-container *ngFor="let pic of selectedPictures">\n            <ion-row *ngIf="!pic.removeMe">\n              <ion-col col-sm-6>\n                <img *ngIf="pic.thumb400"\n                     width="100%" height="auto" [src]="pic.thumb400"/>\n                <img *ngIf="!(pic.thumb400) && pic.localOrigURI"\n                     width="100%" height="auto" [src]="dataProvider.fileURIasSrc(pic.localOrigURI)"/>\n              </ion-col>\n              <ion-col col-sm-6><ion-label class="section-header">Picture Comments</ion-label><ion-textarea type="text" [(ngModel)]="pic.comment"></ion-textarea></ion-col>\n            </ion-row>\n          </ng-container>\n        </div>\n\n        <ion-row>\n          <ion-col>\n            <button ion-button class="full" color="secondary" (click)="clickIndex(selectedRoomIndex+1)">Save and Next</button>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <!-- section for ROOM STATS CHART -->\n      <ion-col *ngIf="(roomID !== \'UNIT SUMMARY\')&&(roomID !== \'PROJECTS\')" col-6 col-md-2 offset-md-1\n      class="donut-side reporting">\n        <ion-row *ngIf="dataProvider.roomStructure[roomID]?.data?.hospitalityCount">\n          <canvas baseChart\n                  [data]="[(dataProvider.roomStructure[roomID].data.hospitalitySum / dataProvider.roomStructure[roomID].data.hospitalityCount),(10- (dataProvider.roomStructure[roomID].data.hospitalitySum / dataProvider.roomStructure[roomID].data.hospitalityCount))]"\n                  [chartType]="\'doughnut\'"\n                  [colors]="dataProvider.roomStructure[roomID].data.chartColors"\n                  [options]="doughnutChartSettings.options"></canvas>\n          <div class="inside-donut">\n            <h2>{{ dataProvider.roomStructure[roomID].data.hospitalityInt }}<span class="decimals">{{ dataProvider.roomStructure[roomID].data.hospitalityRemainder }}</span>\n              <span class="label">Hospitality</span>\n            </h2>\n          </div>\n        </ion-row>\n        <ion-row>\n          <h3>\n            {{dataProvider.roomStructure[roomID]?.data?.completedItemCount}} <span class="label">Items Inspected</span>\n          </h3>\n        </ion-row>\n        <ng-container *ngFor="let timelineID of dataProvider.issueStructure[\'_keys\']">\n          <ion-row *ngIf="dataProvider.roomStructure[roomID]?.data?.issueTypeCounts[timelineID]">\n            <h3>{{dataProvider.roomStructure[roomID].data.issueTypeCounts[timelineID]}} <span class="label">{{timelineID}}</span></h3>\n          </ion-row>\n        </ng-container>\n      </ion-col>\n      <!-- section for UNIT SUMMARY VIEW -->\n      <ion-col *ngIf="(roomID === \'UNIT SUMMARY\')" col-12 col-md-5 offset-md-1>\n        <h2>Unit Summary</h2>\n        <ion-row>\n          <ion-col>\n            <ion-label>Victories</ion-label>\n          </ion-col>\n        </ion-row>\n        <ng-container *ngFor="let victory of ownerReport.victoriesList; let i = index">\n          <ion-row *ngIf="!victory.removeMe"\n                   align-items-center justify-content-center>\n            <ion-col col-1>\n              <ion-icon name="medal"></ion-icon>\n            </ion-col>\n            <ion-col col-10>\n              <ion-input [(ngModel)]="victory.text" type="text" class="ios-padding"></ion-input>\n            </ion-col>\n            <ion-col col-1>\n              <ion-icon (click)="removeVictory(i)" name="close"></ion-icon>\n            </ion-col>\n          </ion-row>\n        </ng-container>\n        <ion-row>\n          <ion-col col-1>\n          </ion-col>\n          <ion-col>\n            <button ion-button (click)="addEmptyVictory()"><div><p>Add<br /> Victory</p></div></button>\n          </ion-col>\n        </ion-row>\n        <ng-container *ngFor="let failure of ownerReport.failuresList; let i = index">\n          <ion-row *ngIf="!failure.removeMe"\n                   align-items-center justify-content-center>\n            <ion-col col-1>\n              <ion-icon name="warning"></ion-icon>\n            </ion-col>\n            <ion-col col-10>\n              <ion-input [(ngModel)]="failure.text" type="text" class="ios-padding"></ion-input>\n            </ion-col>\n            <ion-col col-1>\n              <ion-icon name="close" (click)="removeFailure(i)"></ion-icon>\n            </ion-col>\n          </ion-row>\n        </ng-container>\n        <ion-row>\n          <ion-col col-1>\n          </ion-col>\n          <ion-col>\n            <button ion-button (click)="addEmptyFailure()"><div><p>Add <br />Quality Failure</p></div></button>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col>\n            <ion-label>Unit Summary</ion-label>\n            <ion-textarea [(ngModel)]="ownerReport.unitSummary" type="text"></ion-textarea>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col>\n            <button ion-button class="full" color="secondary" (click)="clickIndex(selectedRoomIndex+1)">Projects</button>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <!-- section for PROJECTS VIEW -->\n      <ion-col *ngIf="(roomID === \'PROJECTS\')" col-12 col-md-5 offset-md-1>\n        <h2>Projects Worth Starting</h2>\n        <!--<ng-container *ngIf="reportFlags[roomID.toUpperCase()].length > 0">-->\n        <ul *ngIf="dataProvider.issueStructure._flagsList.length > 0"\n            style="list-style: none;">\n          <li *ngFor="let flagItem of dataProvider.issueStructure._flagsList">\n            <ion-icon name="flag" style="color:red;"></ion-icon>\n            {{flagItem}}\n          </li>\n        </ul>\n        <ng-container *ngFor="let projObj of ownerReport.projObjList; let i = index">\n          <ng-container *ngIf="!projObj.removeMe">\n            <ion-row align-items-center justify-content-center>\n              <ion-col col-1>\n                <ion-icon name="hammer"></ion-icon>\n              </ion-col>\n              <ion-col col-10>\n                <ion-input [(ngModel)]="projObj.description" type="text" class="ios-padding"></ion-input>\n              </ion-col>\n              <ion-col col-1>\n                <ion-icon name="close" (click)="removeProject(i)"></ion-icon>\n              </ion-col>\n            </ion-row>\n            <ion-row align-items-center justify-content-center>\n              <ion-col col-1>\n              </ion-col>\n              <ion-col col-10>\n                <ion-item>\n                  <ion-range class="project-range" min="0" max="50000" step="500" pin="true" dualKnobs="true" [(ngModel)]="projObj.estimate"\n                             color="secondary" (ionChange)="sliderOnChange($event)" debounce="0">\n                    <ion-label range-left>$0</ion-label>\n                    <ion-label range-right>$50,000</ion-label>\n                    </ion-range>\n                </ion-item>\n              </ion-col>\n              <ion-col col-1>\n              </ion-col>\n            </ion-row>\n          </ng-container>\n        </ng-container>\n        <ion-row>\n          <ion-col col-1>\n          </ion-col>\n          <ion-col>\n            <button ion-button (click)="addNewProject()"><div><p>Add <br />Project</p></div></button>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col>\n            <button class="full" ion-button color="secondary" (click)="showPrintPage()">Print Report</button>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <!-- section for UNIT SUMMARY/PROJECTS chart -->\n      <ion-col *ngIf="(roomID === \'UNIT SUMMARY\')||(roomID === \'PROJECTS\')" col-12 col-md-2 offset-md-1 class="donut-side reporting">\n        <ion-row>\n          <canvas baseChart\n                  [data]="[(dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count),(10- (dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count))]"\n                  [chartType]="\'doughnut\'"\n                  [colors]="dataProvider.hospitalityStructure.chartColors"\n                  [options]="doughnutChartSettings.options"></canvas>\n          <div class="inside-donut">\n            <h2>\n              {{ dataProvider.hospitalityStructure.intPortion }}<span class="decimals">{{ dataProvider.hospitalityStructure.remainderPortion }}</span>\n              <span class="label">Hospitality<br />Score</span>\n            </h2>\n          </div>\n        </ion-row>\n        <ion-row>\n          <h3>\n            {{dataProvider.issueStructure._itemsInspectedCount}} <span class="label">Items Inspected</span>\n          </h3>\n        </ion-row>\n        <ion-row>\n          <h2 class="replacement-header">Timeline</h2>\n        </ion-row>\n        <ion-row *ngFor="let issueID of dataProvider.issueStructure[\'_keys\']">\n          <h3>\n            {{ dataProvider.issueStructure[issueID].count }} <span class="label">{{issueID}}</span>\n          </h3>\n\n        </ion-row>\n      </ion-col>\n    </ion-row>\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/reportcreator/reportcreator.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["k" /* PopoverController */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["i" /* NavParams */],
        __WEBPACK_IMPORTED_MODULE_7__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["m" /* ToastController */], __WEBPACK_IMPORTED_MODULE_8__providers_auth_service__["a" /* AuthService */]])
], ReportCreatorPage);

//# sourceMappingURL=reportcreator.js.map

/***/ }),

/***/ 153:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return propertyReporting; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__reportlist_reportlist__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__popoverinsdate_popoverinsdate__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_auth_service__ = __webpack_require__(28);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var propertyReporting = (function () {
    function propertyReporting(navCtrl, popoverCtrl, dataProvider, auth) {
        this.navCtrl = navCtrl;
        this.popoverCtrl = popoverCtrl;
        this.dataProvider = dataProvider;
        this.auth = auth;
        this.allUnits = this.dataProvider.allUnits;
        this.allReportsByUnit = null;
    }
    propertyReporting.prototype.showReportListPage = function (unit) {
        // Hack to make sure report list doesn't try to immediately render
        delete this.dataProvider.hospitalityStructure.chartColors;
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__reportlist_reportlist__["a" /* ReportListPage */], { unit: unit }, { animate: true, direction: 'forward' });
    };
    propertyReporting.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.dataProvider.initDB(this.auth.currentUser.username, this.auth.currentUser.credential)
            .then(function (result) {
            _this.dataProvider.getAllUnits(_this.auth.currentUser.username)
                .then(function (result) {
                _this.allReportsByUnit = null;
                _this.dataProvider.getAllReportsByUnit()
                    .then(function (resultReport) {
                    _this.allReportsByUnit = resultReport;
                });
            });
        });
    };
    propertyReporting.prototype.getReportDateFromUnit = function (unit) {
        var report = this.allReportsByUnit[unit._id];
        if (!report) {
            return '';
        }
        else {
            var reportID = report._id;
            var month = new Array();
            month[0] = "Jan";
            month[1] = "Feb";
            month[2] = "Mar";
            month[3] = "Apr";
            month[4] = "May";
            month[5] = "Jun";
            month[6] = "Jul";
            month[7] = "Aug";
            month[8] = "Sep";
            month[9] = "Oct";
            month[10] = "Nov";
            month[11] = "Dec";
            var dateObj = new Date(parseInt(reportID.split('/Report')[1].trim()));
            return month[dateObj.getMonth()] + ' ' + dateObj.getDate() + ', ' + dateObj.getFullYear();
        }
    };
    propertyReporting.prototype.getProjectTotalsFromUnit = function (unit) {
        var report = this.allReportsByUnit[unit._id];
        if (!report || !report.projObjDict) {
            return '';
        }
        else {
            var projectsLowTotal = 0;
            var projectsHighTotal = 0;
            var projKeys = Object.keys(report.projObjDict);
            for (var index = 0, len = projKeys.length; index < len; index++) {
                var thisProj = report.projObjDict[projKeys[index]];
                if (!thisProj.removeMe && thisProj.estimate) {
                    projectsLowTotal += thisProj.estimate.lower;
                    projectsHighTotal += thisProj.estimate.upper;
                }
            }
            return '$' + projectsLowTotal + '-' + '$' + projectsHighTotal;
        }
    };
    propertyReporting.prototype.openPopover = function (myEvent) {
        var popover = this.popoverCtrl.create(__WEBPACK_IMPORTED_MODULE_3__popoverinsdate_popoverinsdate__["a" /* PopoverinsdatePage */]);
        popover.present({
            ev: myEvent
        });
    };
    return propertyReporting;
}());
propertyReporting = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-propertyreporting',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/propertyreporting/propertyreporting.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title><img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile"></ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid>\n    <ion-row class="page-nav">\n      <ion-col>\n        <h2 class="page-header">Reporting</h2>\n        <p class="negative-margin">Choose the unit to view latest data or start a new owner\'s report. <strong>Only data from reports that have been started appear on this page</strong>.</p>\n      </ion-col>\n    </ion-row>\n    <div class="reporting-selection">\n    <ion-row>\n      <ion-col>\n        <div class="list-header" item-left>\n          Unit\n        </div>\n      </ion-col>\n      <ion-col>\n        <div class="list-header" item-left>\n          Type\n        </div>\n      </ion-col>\n      <ion-col>\n        <div class="list-header" item-left>\n          Report Date\n        </div>\n      </ion-col>\n      <ion-col>\n        <div class="list-header" item-left>\n          Projects Total\n        </div>\n      </ion-col>\n      <ion-col>\n        <div class="list-header" item-left>\n          Flagged\n        </div>\n      </ion-col>\n      <ion-col>\n        <div class="list-header" item-left>\n          Hospitality Score\n        </div>\n      </ion-col>\n    </ion-row>\n    <ion-row *ngFor="let unit of allUnits.data"\n             tappable\n             (click)="showReportListPage(unit)">\n      <ion-col>\n        <p>\n          {{unit.name}}\n        </p>\n      </ion-col>\n      <ion-col>\n        <p>\n          {{unit.unitTemplate.displayName}}\n        </p>\n      </ion-col>\n      <ion-col>\n        <p *ngIf="allReportsByUnit && allReportsByUnit[unit._id]">\n          {{getReportDateFromUnit(unit)}}\n        </p>\n        <p *ngIf="allReportsByUnit && !allReportsByUnit[unit._id]">\n          Report not started\n        </p>\n      </ion-col>\n      <ion-col>\n        <p *ngIf="allReportsByUnit">\n          {{getProjectTotalsFromUnit(unit)}}\n        </p>\n      </ion-col>\n      <ion-col>\n        <p *ngIf="allReportsByUnit">\n          {{dataProvider.dataByUnit[unit._id].byUnitIssueStructure._flagsList.length}}\n        </p>\n      </ion-col>\n      <ion-col>\n        <p *ngIf="allReportsByUnit">\n          {{dataProvider.dataByUnit[unit._id].score | number:\'1.2-2\'}}\n        </p>\n      </ion-col>\n    </ion-row>\n  </div>\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/propertyreporting/propertyreporting.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* PopoverController */], __WEBPACK_IMPORTED_MODULE_4__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_5__providers_auth_service__["a" /* AuthService */]])
], propertyReporting);

//# sourceMappingURL=propertyreporting.js.map

/***/ }),

/***/ 161:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 161;

/***/ }),

/***/ 203:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 203;

/***/ }),

/***/ 251:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_auth_service__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__inspectionlist_inspectionlist__ = __webpack_require__(133);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



//import { RegisterPage } from '../register/register';

var LoginPage = (function () {
    function LoginPage(nav, auth, alertCtrl, loadingCtrl /*, private zone: NgZone*/) {
        this.nav = nav;
        this.auth = auth;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl; /*, private zone: NgZone*/
        this.registerCredentials = { username: '', password: '', rememberMe: false };
    }
    LoginPage.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.auth.attemptRememberedLogin()
            .then(function (isAllowed) {
            if (isAllowed) {
                _this.showLoading();
                _this.userIsAllowed();
            }
        });
        // This line shows the kind of error that the cloud error monitoring system catches and displays
        //throw new Error('I am a bug... 🐛');
    };
    /*public createAccount() {
      this.nav.push(RegisterPage);
    }*/
    LoginPage.prototype.login = function () {
        var _this = this;
        this.showLoading();
        // Make sure server session isn't reused by new user
        this.auth.logout().subscribe(function () {
            return _this.auth.login(_this.registerCredentials).subscribe(function (allowed) {
                if (allowed) {
                    _this.userIsAllowed();
                }
                else {
                    _this.showError('Login Failed');
                }
            }, function (error) {
                _this.showError(error);
            });
        });
    };
    LoginPage.prototype.userIsAllowed = function () {
        //this.zone.run(() => {
        this.loading.dismiss();
        this.nav.setRoot(__WEBPACK_IMPORTED_MODULE_3__inspectionlist_inspectionlist__["a" /* InspectionListPage */]);
        //});
    };
    LoginPage.prototype.showLoading = function () {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        this.loading.present();
    };
    LoginPage.prototype.showError = function (text) {
        var _this = this;
        setTimeout(function () {
            _this.loading.dismiss();
        });
        var alert = this.alertCtrl.create({
            title: 'Login Failed',
            subTitle: text,
            buttons: ['OK']
        });
        alert.present(prompt);
    };
    return LoginPage;
}());
LoginPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-login',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/login/login.html"*/'\n<ion-content class="login-content">\n  <form (ngSubmit)="login()" #registerForm="ngForm">\n    <ion-row justify-content-center >\n      <ion-col col-md-4 class="login" justify-content-center>\n        <img src="assets/img/mymarsi-logo-large.png" alt="Logo" />\n        <h1>Please Login</h1>\n        <ion-label>Username</ion-label>\n        <ion-input type="text"  name="username" [(ngModel)]="registerCredentials.username" required></ion-input>\n        <ion-label>Password</ion-label>\n        <ion-input type="password"  name="password" [(ngModel)]="registerCredentials.password" required></ion-input>\n\n        <ion-item>\n          <ion-checkbox name="rememberMe" [(ngModel)]="registerCredentials.rememberMe"></ion-checkbox>\n            <ion-label>Remember me</ion-label>\n          </ion-item>\n        <button ion-button class="submit-btn" full type="submit">Login</button>\n        Build: 2.0.8\n      </ion-col>\n    </ion-row>\n\n  </form>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/login/login.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__providers_auth_service__["a" /* AuthService */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* AlertController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* LoadingController */] /*, private zone: NgZone*/])
], LoginPage);

//# sourceMappingURL=login.js.map

/***/ }),

/***/ 253:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PopoverTradePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var PopoverTradePage = (function () {
    function PopoverTradePage(navCtrl, viewCtrl, navParams, dataProvider) {
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.dataProvider = dataProvider;
        this.metadata = {};
    }
    PopoverTradePage.prototype.ngOnInit = function () {
        var metadata = this.navParams.get('metadata');
        if (typeof (metadata) !== 'undefined') {
            this.metadata = metadata;
        }
    };
    PopoverTradePage.prototype.selectTrade = function (tradeID) {
        for (var index = 0; index < this.dataProvider.templateStructure[this.metadata.currentRoomID].tradeIDs.length; index++) {
            var thisTradeID = this.dataProvider.templateStructure[this.metadata.currentRoomID].tradeIDs[index];
            if (thisTradeID === tradeID) {
                this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
                var firstItemInSelectedTrade = this.dataProvider.templateStructure[this.metadata.currentRoomID].itemsByTrade[tradeID][0];
                this.dataProvider.createItemStructIfNotExist(this.metadata.currentRoomID, firstItemInSelectedTrade._id);
                // This is commented out because I thought I might have to set the in-memory store this way for all items but maybe not
                /*let roomIDs = this.dataProvider.findAllRooms(this.metadata.currentRoomID, firstItemInSelectedTrade._id);
                let justItemWithoutRoom = firstItemInSelectedTrade._id.split(roomIDs[0] + '|').join('');
        
                for (let roomID of roomIDs) {
                  let itemInRoom = roomID + '|' + justItemWithoutRoom;
                  this.dataProvider.createItemStructIfNotExist(roomID, itemInRoom);
                }*/
                // This is how to influence the inspection creator component UI
                this.metadata.currentTradeIndex = index;
                this.metadata.currentTradeID = tradeID;
                this.metadata.applyToAll = false;
                this.metadata.selectedItem = firstItemInSelectedTrade;
                break;
            }
        }
    };
    PopoverTradePage.prototype.close = function () {
        this.viewCtrl.dismiss();
    };
    return PopoverTradePage;
}());
PopoverTradePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        template: "\n    <ion-list>\n      <button ion-item\n              *ngFor=\"let tradeID of dataProvider.templateStructure[metadata.currentRoomID].tradeIDs\"\n              (click)=\"selectTrade(tradeID);close()\">\n                {{tradeID}}\n      </button>\n    </ion-list>\n  "
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ViewController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2__providers_data__["a" /* Data */]])
], PopoverTradePage);

//# sourceMappingURL=popovertrade.js.map

/***/ }),

/***/ 28:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export User */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__ = __webpack_require__(252);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_catch__ = __webpack_require__(484);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_catch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_catch__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_observable_throw__ = __webpack_require__(486);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_observable_throw___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_observable_throw__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_storage__ = __webpack_require__(244);
// This auth code and login component built from https://devdactic.com/login-ionic-2/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var rememberedUserString = 'rememberedUser';
var rememberedUserCredString = 'rememberedUserCred';
var User = (function () {
    function User(name, username, credential) {
        this.name = name;
        this.username = username;
        this.credential = credential;
    }
    return User;
}());

var AuthService = (function () {
    function AuthService(http, storage) {
        this.http = http;
        this.storage = storage;
        this.currentUser = null;
        this.authServerString = 'https://marsi-envoy.herokuapp.com';
        this.authURLPath = '/_auth';
        this.logoutURLPath = '/_logout';
    }
    AuthService.prototype.attemptRememberedLogin = function () {
        var _this = this;
        return this.storage.get(rememberedUserString)
            .then(function (username) {
            if (username) {
                return _this.storage.get(rememberedUserCredString)
                    .then(function (credential) {
                    console.log('Successful login for remembered user');
                    _this.currentUser = { name: '', username: username, credential: credential };
                    return true;
                });
            }
        })
            .catch(function () {
            return false;
        });
    };
    AuthService.prototype.login = function (credentials) {
        var _this = this;
        if (credentials.username === null || credentials.password === null) {
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__["Observable"].throw("Please insert credentials");
        }
        else {
            var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]({ 'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password) });
            var options = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* RequestOptions */]({ headers: headers });
            return this.http.get(this.authServerString + this.authURLPath, options)
                .map(function (resp) {
                if (resp.status === 200) {
                    _this.currentUser = new User('', credentials.username, credentials.password);
                    console.log('Successful login');
                    if (credentials.rememberMe) {
                        _this.storage.set(rememberedUserString, credentials.username);
                        _this.storage.set(rememberedUserCredString, credentials.password);
                    }
                    return true;
                }
            })
                .catch(function (error) {
                var errMsg;
                if (error instanceof __WEBPACK_IMPORTED_MODULE_1__angular_http__["e" /* Response */]) {
                    if (error.status === 403) {
                        errMsg = 'This username/password could not be verified; please try again';
                    }
                    else {
                        var body = error.json() || '';
                        var err = body.error || JSON.stringify(body);
                        errMsg = error.status + " - " + (error.statusText || '') + " " + err;
                    }
                }
                else {
                    errMsg = error.message ? error.message : error.toString();
                }
                console.error(errMsg);
                return __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__["Observable"].throw(errMsg);
            });
        }
    };
    // This is commented out because we don't allow registration yet
    /*public register(credentials) {
      if (credentials.username === null || credentials.password === null) {
        return Observable.throw("Please insert credentials");
      } else {
        // At this point store the credentials to your backend!
        return Observable.create(observer => {
          observer.next(true);
          observer.complete();
        });
      }
    }*/
    AuthService.prototype.getUserInfo = function () {
        return this.currentUser;
    };
    AuthService.prototype.logout = function () {
        this.storage.remove(rememberedUserString);
        this.storage.remove(rememberedUserCredString);
        this.currentUser = null;
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]({ 'Content-Type': 'application/json' });
        var options = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* RequestOptions */]({ headers: headers, withCredentials: true });
        return this.http.get(this.authServerString + this.logoutURLPath, options)
            .map(function (resp) {
            console.log('Successful logout');
            return true;
        })
            .catch(function (error) {
            var errMsg;
            if (error instanceof __WEBPACK_IMPORTED_MODULE_1__angular_http__["e" /* Response */]) {
                var body = error.json() || '';
                var err = body.error || JSON.stringify(body);
                errMsg = error.status + " - " + (error.statusText || '') + " " + err;
            }
            else {
                errMsg = error.message ? error.message : error.toString();
            }
            console.error(errMsg);
            return __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__["Observable"].throw(errMsg);
        });
    };
    return AuthService;
}());
AuthService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */], __WEBPACK_IMPORTED_MODULE_6__ionic_storage__["b" /* Storage */]])
], AuthService);

//# sourceMappingURL=auth-service.js.map

/***/ }),

/***/ 407:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PrintPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__reportcreator_reportcreator__ = __webpack_require__(152);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var PrintPage = (function () {
    function PrintPage(navCtrl, navParams, dataProvider, datePipe) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.dataProvider = dataProvider;
        this.datePipe = datePipe;
        // In case print component is opened without being passed report data
        this.ownerReport = {};
        this.unit = {
            _id: '',
            name: '',
            unitTemplate: {
                displayName: ''
            }
        };
        this.doughnutChartSettings = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "75",
                aspectRatio: 1
            }
        };
    }
    PrintPage.prototype.ionViewDidLoad = function () {
        var ownerReport = this.navParams.get('ownerReport');
        if ((typeof (ownerReport) !== 'undefined') && (typeof (ownerReport.roomObjList) !== 'undefined')) {
            this.ownerReport = ownerReport;
        }
        var unit = this.navParams.get('unit');
        if ((typeof (unit) !== 'undefined') && (typeof (unit._id) !== 'undefined')) {
            this.unit = unit;
        }
        var htmlClassNames = document.documentElement.className;
        if (htmlClassNames.trim() === '') {
            document.documentElement.className = 'print-control';
        }
        else {
            document.documentElement.className = htmlClassNames + ' print-control';
        }
    };
    PrintPage.prototype.getVisitTimestampFromID = function (lastVisitID) {
        return +lastVisitID.slice(lastVisitID.lastIndexOf(' ') + 1, lastVisitID.length);
    };
    PrintPage.prototype.getUpdateStringForPrintReport = function () {
        var lastVisitID = this.dataProvider.inspectionData.lastVisitID;
        if (lastVisitID && (lastVisitID !== '')) {
            var returnDate = this.datePipe.transform(this.getVisitTimestampFromID(lastVisitID), 'MMM yyyy');
            return 'Score last updated: ' + returnDate;
        }
        else {
            return 'Inspection date: ' + this.dataProvider.inspectionData.name;
        }
    };
    PrintPage.prototype.clickBack = function () {
        var htmlClassNames = document.documentElement.className;
        document.documentElement.className = htmlClassNames.split('print-control').join('');
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_3__reportcreator_reportcreator__["a" /* ReportCreatorPage */], { ownerReport: this.ownerReport, unit: this.unit, roomID: 'PROJECTS' }, { animate: true, direction: 'backward' });
    };
    return PrintPage;
}());
PrintPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-print',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/print/print.html"*/'\n\n<ion-content padding class="printlayout">\n  <ion-grid>\n    <ion-row class="page-nav  ">\n      <ion-col>\n        <button (click)="clickBack()" class="hide-on-print">Back</button>\n        <h2 class="page-header mymarsi">{{ownerReport.unitName}} - {{unit.unitTemplate.displayName}}</h2>\n        <p class="inspector">\n          Inspector: Kim Scott<br>\n          {{getUpdateStringForPrintReport()}}\n          </p>\n      </ion-col>\n    </ion-row>\n    <ion-row >\n      <ion-col col-12>\n        <img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile">\n        <h2 class="mymarsi">About MyMARSi&#174;</h2>\n        <h4>Maintenance Assessment Reporting System - Interface</h4>\n        <p>As a home management service we collaborate with owners and managers to honestly assess both victories and quality failures so that they can get the most out of their vacation rental properties without sacrificing their investment or integrity.\n          Together we can help owners stay competitive and current by offering discoverable insight with actionable, easy to follow timelines with prioritized maintenance projects giving them the peace of mind to focus on their investment without sacrificing\n          their integrity collaborate with you to achieve a competitive and up-to-date interior. It’s not just about making sure the condo has necessary interior amenities, but that those amenities meet the standards guests require of you. Owners who\n          meet rental-ready standards earn a MyMARSi&#174; seal of approval. This branding gives guests confidence that a property’s visual online representation is equal to its’ true appeal.\n        </p>\n\n        <p>MyMARSi&#174; keeps condo owners informed of unit status and takes the guesswork out of solving problems that arise. The inspection ensures a qualified person checks every aspect of your condo from doorknobs to dishwashers, linens to light fixtures.\n          Each issue is graded based on the urgency of the project. Together, we create a scalable plan to suit improvement needs and timing.\n        </p>\n\n        <p>Our inspectors are professional tradesmen who use an advanced reporting interface to perform detailed inspections. Our reports are easy-to-read summaries of the inspection that include actionable information such as the prioritized project timeline.\n        </p>\n            <p><small>This report is intended solely for information purposes and is not to be construed as any warranty. MyMARSi&#174; and the Inspector do not provide any warranty for the items identified in this report whatsoever. This report contains forward-looking statements and information, which reflect the current view with respect to future events and financial performance.  Actual results may differ materially from the expectations expressed or implied in the forward-looking statements as a result of known and unknown risks and uncertainties. MyMARSi&#174; and the Inspector take no responsibility or accept any liability for any loss or damage arising from decisions made as a result of information contained in our reports or services and urges its clients to make independent inquiries to satisfy themselves as to the accuracy or completeness of the information we provide. Any unauthorized disclosure, use, reproduction, or distribution of the descriptive, analytical or predictive information provided to you by MyMARSi&#174; in its reports or services is not permitted and MyMARSi&#174; reports, its content and photographs and are protected by copyright.\n            </small></p>\n            <p><strong>All content is protected by copyright and trademark owned by MyMARSi&#174; LLC</strong></p>\n            <div class="page-break">&nbsp;</div>\n\n      </ion-col>\n    </ion-row>\n    <ion-row >\n      <ion-col col-12>\n\n        <h2>How To Use This Report</h2>\n\n<p>In your report you receive two scores. Your Cumulative Hospitality Score identifies the current status of your unit as it relates to the quality assurance standards. The Room-specific Hospitality Scores helps you realize which areas of your unit need the most attention.</p>\n\n<p>The first section of your report summarizes the results of the inspection. Within the summary there are five categories of compliance ranging from Urgent (needing immediate attention) to Zen (need only scheduled maintenance or upkeep).\n</p>\n<img src="assets/img/timeline-explanation.jpg" alt="Timeline Explanation" class="center">\n<p>In this report, we highlighted your unit’s victories and areas of improvement. This is a easy-to-read overview of the key inspection results. </p>\n<p>For an actionable summary of recommended improvements, visit the Projects Worth Starting section.  This section includes estimated costs and recommended vendor types. </p>\n<p>The detailed room-by-room reports walk owners through the unit and describe the features and functionality through the eyes of a guest or property manager. </p>\n\n\n\n      </ion-col>\n    </ion-row>\n    <div class="page-break">&nbsp;</div>\n    <ion-row >\n      <ion-col col-12>\n\n        <h2>How the timeline works: Priority + Timeline = Comfort Level &#8482;</h2>\n      <h3>&lt; 30 Days<span class="label">Priority :  Urgent |  Comfort Level : Safety\n</span></h3>\n      <p>Items in this area are considered urgent or have potential to become urgent if not addressed within the next 30 days. Generally these are maintenance items that get resolved rather quickly by you, your vendors or your property manager\'s maintenance department.</p>\n<h3>&lt; 6 months<span class="label">Priority :  Serious |  Comfort Level : Quality of Life\n </span></h3>\n<p>Items in this area are considered serious or have potential to become serious if not addressed within the next 6 months or 180 days.Generally these are items that may need coordinating with a property services vendor in order to schedule and get done.\n</p>\n<h3>&lt; 1 Year<span class="label">Priority :  Immediate |  Comfort Level : Fragility\n </span></h3>\n<p>Items in this area are considered immediate or have potential to become immediate if not addressed within the next year or 365 days. Generally these are items that may require planning, budgeting or special ordering in order to get them done.  You may also have a maximum deadline agreement in place for maintaining property standards to remain in your property manager\'s program.</p>\n<h3>&lt; 2 years<span class="label">Priority :  Delayed |  Comfort Level : Comfortability\n </span></h3>\n<p>Items in this area are considered delayed and are considered not to be of concern in the immediate future if maintained well or installed correctly. If you see items here it could be needing some attention in the near future, essentially these items are on a watch list for maintenance or replacement.</p>\n<h3>2+ Years<span class="label">Priority :  Zen |  Comfort Level : Hospitality\n </span></h3>\n<p>Items in this area are considered Zen and are considered not to be of concern in the next to years if maintained well or installed correctly. Relax, kickback and give yourself a pat on the back.  Enjoy a job well done you\'ve made the most out of staying competitive and made your guests and property manager very happy!</p>\n\n\n      </ion-col>\n    </ion-row>\n      <div class="page-break">&nbsp;</div>\n\n    <ion-row >\n      <ion-col col-6>\n        <h2 >Overall</h2>\n        <p>{{ownerReport.unitSummary}}</p>\n\n\n      </ion-col>\n      <ion-col col-5 offset-1 class="donut-side">\n        <div class="graph">\n          <canvas baseChart\n                  [data]="[(dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count),(10- (dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count))]"\n                  [chartType]="\'doughnut\'"\n                  [colors]="dataProvider.hospitalityStructure.chartColors"\n                  [options]="doughnutChartSettings.options"></canvas>\n                  <div class="inside-donut">\n                    <h2>\n                      {{ dataProvider.hospitalityStructure.intPortion }}<span class="decimals">{{ dataProvider.hospitalityStructure.remainderPortion }}</span>\n                      <span class="label">Unit Hospitality Score</span>\n                    </h2>\n                  </div>\n        </div>\n        <div class="text-center-align">\n\n          <h3>\n            {{dataProvider.issueStructure._itemsInspectedCount}} <span class="label">Items Inspected</span>\n          </h3>\n          <h2 class="replacement-header">Timeline</h2>\n          <ng-container *ngFor="let issueID of dataProvider.issueStructure[\'_keys\']">\n            <ng-container *ngIf="dataProvider.issueStructure[issueID].count">\n              <p class="large-number">{{ dataProvider.issueStructure[issueID].count }}</p>\n              <p class="label">{{issueID}}<span>{{ dataProvider.issueStructure[issueID].timelineText }}</span></p>\n            </ng-container>\n          </ng-container>\n        </div>\n      </ion-col>\n\n\n    </ion-row>\n    <div class="page-break">&nbsp;</div>\n    <ion-row >\n      <ion-col>\n        <ion-row>\n          <h2>Highlights</h2>\n          <p>Below are the victories and quality failures. The victories are areas where your unit meets or exceeds property minimum standards or expectations. The quality failures are areas of improvements as they may not meet currently property minimum standards or expectations. </p>\n          <ion-col col-5 offset-1>\n\n            <h3 >Victories</h3>\n            <ng-container *ngFor="let victory of ownerReport.victoriesList">\n              <ion-row *ngIf="!victory.removeMe">\n                <ion-col col-2>\n                  <ion-icon name="medal"></ion-icon>\n                </ion-col>\n                <ion-col col-9 offset-1>\n                  {{victory.text}}\n                </ion-col>\n              </ion-row>\n          </ng-container>\n          </ion-col>\n          <ion-col col-5 offset-1>\n            <h3>Quality Failures</h3>\n            <ng-container *ngFor="let failure of ownerReport.failuresList">\n              <ion-row *ngIf="!failure.removeMe">\n                <ion-col col-2>\n                  <ion-icon name="warning"></ion-icon>\n                </ion-col>\n                <ion-col col-9 offset-1>\n                  {{failure.text}}\n                </ion-col>\n              </ion-row>\n            </ng-container>\n          </ion-col>\n        </ion-row>\n\n    </ion-col>\n    </ion-row >\n    <div class="page-break">&nbsp;</div>\n        <ion-row >\n          <ion-col>\n        <ion-row >\n          <ion-col col-12>\n            <h2>Room Hospitality Scores</h2>\n            <h4>All hospitality scores are on a 1-10 scale, with 10 being the most desirable</h4>\n            <p><span class="red">Red</span> indicates a score 0-3.3</p>\n              <p><span class="blue">Blue</span> indicates a score 3.4-6.6</p>\n              <p><span class="green">Green</span> indicates a score 6.7-10</p>\n          </ion-col>\n          <ion-col col-3 *ngFor="let roomObj of ownerReport.roomObjList">\n\n            <h3 class="room-name">\n              <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[roomObj.name]">\n                {{dataProvider.inspectionTemplate.roomAliases[roomObj.name]}}\n              </span>\n              <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[roomObj.name]">\n                {{roomObj.name}}\n              </span>\n            </h3>\n\n              <canvas baseChart\n                      [data]="[(dataProvider.roomStructure[roomObj.name].data.hospitalitySum / dataProvider.roomStructure[roomObj.name].data.hospitalityCount),(10- (dataProvider.roomStructure[roomObj.name].data.hospitalitySum / dataProvider.roomStructure[roomObj.name].data.hospitalityCount))]"\n                      [chartType]="\'doughnut\'"\n                      [colors]="dataProvider.roomStructure[roomObj.name].data.chartColors"\n                      [options]="doughnutChartSettings.options"></canvas>\n                        <div class="small-inside-donut">\n                {{ dataProvider.roomStructure[roomObj.name].data.hospitalityInt }}<span class="decimals">{{ dataProvider.roomStructure[roomObj.name].data.hospitalityRemainder }}</span>\n                <span class="label">Room Hospitality Score</span>\n\n\n            </div>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n\n    </ion-row>\n    <div class="page-break">&nbsp;</div>\n    <ion-row >\n      <ion-col>\n        <h3 >Projects Worth Starting&#8482;</h3>\n        <ng-container *ngFor="let projObj of ownerReport.projObjList">\n          <ion-row *ngIf="!projObj.removeMe">\n            <ion-col col-1>\n              <ion-icon name="hammer"></ion-icon>\n            </ion-col>\n            <ion-col col-11>\n              <ion-row>{{projObj.description}}</ion-row>\n              <ion-row>${{projObj.estimate.lower}} - ${{projObj.estimate.upper}}</ion-row>\n            </ion-col>\n          </ion-row>\n        </ng-container>\n      </ion-col>\n\n\n    </ion-row>\n    <div *ngFor="let roomObj of ownerReport.roomObjList">\n    <div class="page-break">&nbsp;</div>\n    <ion-row  >\n      <ion-col col-6>\n        <h2>\n          <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[roomObj.name]">\n            {{dataProvider.inspectionTemplate.roomAliases[roomObj.name]}}\n          </span>\n          <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[roomObj.name]">\n            {{roomObj.name}}\n          </span>\n        </h2>\n        <ng-container *ngIf="dataProvider.roomStructure[roomObj.name].data.flagsList.length > 0">\n          <ion-icon name="flag" style="color:red;"></ion-icon>\n          {{dataProvider.roomStructure[roomObj.name].data.flagsList.join(\', \')}}\n        </ng-container>\n        <p>{{roomObj.summary}}</p>\n        <ion-row>\n          <ng-container *ngFor="let picObj of roomObj.selectedPicObjs">\n            <ion-col *ngIf="!picObj.removeMe"\n                     col-6>\n              <img *ngIf="picObj.thumb800"\n                  width="100%" height="auto" [src]="picObj.thumb800" />\n              <img *ngIf="!(picObj.thumb800) && picObj.localOrigURI\n                  width="100%" height="auto" [src]="dataProvider.fileURIasSrc(picObj.localOrigURI)" />\n              <p>{{picObj.comment}}</p>\n            </ion-col>\n          </ng-container>\n        </ion-row>\n      </ion-col>\n      <ion-col col-5 offset-1 class="donut-side">\n        <div class="graph">\n          <canvas baseChart\n                  [data]="[(dataProvider.roomStructure[roomObj.name].data.hospitalitySum / dataProvider.roomStructure[roomObj.name].data.hospitalityCount),(10- (dataProvider.roomStructure[roomObj.name].data.hospitalitySum / dataProvider.roomStructure[roomObj.name].data.hospitalityCount))]"\n                  [chartType]="\'doughnut\'"\n                  [colors]="dataProvider.roomStructure[roomObj.name].data.chartColors"\n                  [options]="doughnutChartSettings.options"></canvas>\n                <div class="inside-donut">\n                  <h2>\n                    {{ dataProvider.roomStructure[roomObj.name].data.hospitalityInt }}<span class="decimals">{{ dataProvider.roomStructure[roomObj.name].data.hospitalityRemainder }}</span>\n                    <span class="label">Room Hospitality Score</span>\n                  </h2>\n                </div>\n        </div>\n        <div class="text-center-align">\n\n          <!--<h3>Replacement Timeline</h3>-->\n          <p class="large-number">{{dataProvider.roomStructure[roomObj.name].data.itemList.length}}</p>\n          <p class="label">Items Inspected</p>\n          <ng-container *ngFor="let timelineID of dataProvider.issueStructure[\'_keys\']">\n            <ng-container *ngIf="dataProvider.roomStructure[roomObj.name].data.issueTypeCounts[timelineID]">\n              <p class="large-number" *ngIf="dataProvider.roomStructure[roomObj.name].data.issueTypeCounts[timelineID]">\n                {{dataProvider.roomStructure[roomObj.name].data.issueTypeCounts[timelineID]}}\n              </p>\n              <p class="label">{{timelineID}}</p>\n            </ng-container>\n          </ng-container>\n        </div>\n      </ion-col>\n\n    </ion-row>\n  </div>\n  <div class="page-break">&nbsp;</div>\n  <ion-row >\n    <ion-col col-12>\n\n      <h2 class="mymarsi">FAQs</h2>\n<h3>What are the quality assurance requirements?</h3>\n<p>We worked with property managers to establish quality standards. The requirements are described in the Quality Assurance Compliance & Benchmarks document. The requirements outline expectations for Luxury, Deluxe, Standard, and Economy units.</p>\n<h3>What gives a MyMARSi&#174; inspection credibility?</h3>\n<p>The MyMARSi&#174; software is designed to rank a property on three levels: qualitative, subjective, and clinical. The inspections are performed by industry experts with 20+ years experience.</p>\n<h3>What should I do with this report?</h3>\n<p>Use the timeline to prioritize maintenance projects. Work with property managers to upgrade your unit. Call local contractors to discuss larger projects.</p>\n<h3>Why is preventative maintenance important?</h3>\n<p>By initiating a preventative maintenance inspection approach, our assessments provide valuable insight to the market.  S.M.A.R.T.&#8482; vacation rental owners continually transform their investment properties to keep them visually appealing and comfortable – updated livable spaces that attract new guests and repeat business with ease!</p>\n<h5>About this report</h5>\n\n<p><small>This report is intended solely for information purposes and is not to be construed as any warranty. MyMARSi&#174; and the Inspector do not provide any warranty for the items identified in this report whatsoever. This report contains forward-looking statements and information, which reflect the current view with respect to future events and financial performance.  Actual results may differ materially from the expectations expressed or implied in the forward-looking statements as a result of known and unknown risks and uncertainties. MyMARSi&#174; and the Inspector take no responsibility or accept any liability for any loss or damage arising from decisions made as a result of information contained in our reports or services and urges its clients to make independent inquiries to satisfy themselves as to the accuracy or completeness of the information we provide. Any unauthorized disclosure, use, reproduction, or distribution of the descriptive, analytical or predictive information provided to you by MyMARSi&#174; in its reports or services is not permitted and MyMARSi&#174; reports, its content and photographs and are protected by copyright. </small></p>\n\n\n<p><strong>All content is protected by copyright and trademark owned by MyMARSi&#174; LLC</strong></p>\n\n\n    </ion-col>\n  </ion-row>\n\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/print/print.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["i" /* NavParams */], __WEBPACK_IMPORTED_MODULE_4__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_1__angular_common__["c" /* DatePipe */]])
], PrintPage);

//# sourceMappingURL=print.js.map

/***/ }),

/***/ 408:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PopoverFlagsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_auth_service__ = __webpack_require__(28);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var PopoverFlagsPage = (function () {
    function PopoverFlagsPage(navCtrl, viewCtrl, navParams, dataProvider, auth) {
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.dataProvider = dataProvider;
        this.auth = auth;
        this.metadata = {};
        this.roomID = this.navParams.get('roomID');
        this.itemID = this.navParams.get('itemID');
        this.itemName = this.navParams.get('itemName');
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
    }
    PopoverFlagsPage.prototype.ngOnInit = function () {
        var metadata = this.navParams.get('metadata');
        if (typeof (metadata) !== 'undefined') {
            this.metadata = metadata;
        }
    };
    PopoverFlagsPage.prototype.close = function () {
        this.viewCtrl.dismiss();
    };
    // this.navParams.get('invokeSavePopup')(itemName + ' was saved in ' + roomID);
    PopoverFlagsPage.prototype.toggleReportFlag = function () {
        console.log('report flag toggled');
        this.dataProvider.inspectionData.data[this.roomID].data[this.itemID].reportFlag = !this.dataProvider.inspectionData.data[this.roomID].data[this.itemID].reportFlag;
        this.dataProvider.currentUnsavedItemData.reportFlag = this.dataProvider.inspectionData.data[this.roomID].data[this.itemID].reportFlag;
        this.dataProvider.saveCurrentUnsavedItemData(this.auth.currentUser.username, [this.roomID], this.itemID);
    };
    PopoverFlagsPage.prototype.toggleRepairFlagsList = function () {
        if (this.dataProvider.roomStructure[this.roomID].data.repairFlagsList.indexOf(this.itemName) === -1) {
            console.log('adding flag to repair array');
            this.dataProvider.issueStructure._repairFlagsList.push(this.itemID);
            this.dataProvider.roomStructure[this.roomID].data.repairFlagsList.push(this.itemName);
        }
        else {
            console.log('removing flag to repair array');
            this.dataProvider.issueStructure._repairFlagsList.splice(this.dataProvider.issueStructure._repairFlagsList.indexOf(this.itemID), 1);
            this.dataProvider.roomStructure[this.roomID].data.repairFlagsList.splice(this.dataProvider.roomStructure[this.roomID].data.repairFlagsList.indexOf(this.itemName), 1);
        }
        console.log(this.dataProvider.roomStructure[this.roomID].data.repairFlagsList);
        this.toggleReportFlag();
    };
    PopoverFlagsPage.prototype.toggleInstallFlagsList = function () {
        if (this.dataProvider.roomStructure[this.roomID].data.repairFlagsList.indexOf(this.itemName) === -1) {
            console.log('adding flag to install array');
            this.dataProvider.issueStructure._installFlagsList.push(this.itemID);
            this.dataProvider.roomStructure[this.roomID].data.installFlagsList.push(this.itemName);
        }
        else {
            console.log('removing flag to install array');
            this.dataProvider.issueStructure._installFlagsList.splice(this.dataProvider.issueStructure._installFlagsList.indexOf(this.itemID), 1);
            this.dataProvider.roomStructure[this.roomID].data.installFlagsList.splice(this.dataProvider.roomStructure[this.roomID].data.installFlagsList.indexOf(this.itemName), 1);
        }
        this.toggleReportFlag();
    };
    PopoverFlagsPage.prototype.toggleReplaceFlagsList = function () {
        if (this.dataProvider.roomStructure[this.roomID].data.repairFlagsList.indexOf(this.itemName) === -1) {
            console.log('adding flag to replace array');
            this.dataProvider.issueStructure._replaceFlagsList.push(this.itemID);
            this.dataProvider.roomStructure[this.roomID].data.replaceFlagsList.push(this.itemName);
        }
        else {
            console.log('removing flag to replace array');
            this.dataProvider.issueStructure._replaceFlagsList.splice(this.dataProvider.issueStructure._replaceFlagsList.indexOf(this.itemID), 1);
            this.dataProvider.roomStructure[this.roomID].data.replaceFlagsList.splice(this.dataProvider.roomStructure[this.roomID].data.replaceFlagsList.indexOf(this.itemName), 1);
        }
        this.toggleReportFlag();
    };
    return PopoverFlagsPage;
}());
PopoverFlagsPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        template: "\n    <ion-list>\n      <button *ngIf=\"false\" ion-item (click)=\"toggleItemFlag();close()\">Clear</button>\n      <button *ngIf=\"false\" ion-item (click)=\"toggleItemFlag('install');close()\">Install</button>\n      <button *ngIf=\"false\" ion-item (click)=\"toggleItemFlag('replace');close()\">Replace</button>\n      <button \n        *ngIf=\"true\" \n        ion-item \n        (click)=\"toggleRepairFlagsList();close()\">\n          Repair\n        </button>\n    </ion-list>\n  "
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ViewController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_3__providers_auth_service__["a" /* AuthService */]])
], PopoverFlagsPage);

//# sourceMappingURL=popoverflags.js.map

/***/ }),

/***/ 409:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Issuetypes; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__reportlist_reportlist__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_auth_service__ = __webpack_require__(28);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var Issuetypes = (function () {
    function Issuetypes(navCtrl, navParams, popoverCtrl, dataProvider, auth, toast) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.popoverCtrl = popoverCtrl;
        this.dataProvider = dataProvider;
        this.auth = auth;
        this.toast = toast;
        this.unit = {
            id: '',
            name: ''
        };
        this.sortedFlaggedItemCategories = [];
        this.topDoughnutChart = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "80",
                aspectRatio: 1
            }
        };
        this.shownItemDetails = '';
        this.inspectionData = this.dataProvider.inspectionData;
        this.roomStructure = this.dataProvider.roomStructure;
        this.inspectionTemplate = this.dataProvider.inspectionTemplate;
        this.issueStructure = this.dataProvider.issueStructure;
        this.inspectionObjList = this.dataProvider.inspectionObjList;
    }
    Issuetypes.prototype.ionViewDidLoad = function () {
        var unit = this.navParams.get('unit');
        if (typeof (unit) !== 'undefined') {
            this.unit = unit;
        }
        var sortedFlaggedItemCategories = this.navParams.get('sortedFlaggedItemCategories');
        if (typeof (sortedFlaggedItemCategories) !== 'undefined') {
            this.sortedFlaggedItemCategories = sortedFlaggedItemCategories;
        }
    };
    Issuetypes.prototype.toggleItemDetails = function (itemID) {
        if (this.isItemDetailShown(itemID)) {
            this.shownItemDetails = '';
        }
        else {
            this.shownItemDetails = itemID;
        }
    };
    ;
    Issuetypes.prototype.isItemDetailShown = function (itemID) {
        return this.shownItemDetails === itemID;
    };
    ;
    Issuetypes.prototype.showAdminDataPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__reportlist_reportlist__["a" /* ReportListPage */], {
            unit: this.unit,
            noInspectionLoad: true
        }, { animate: true, direction: 'backward' });
    };
    Issuetypes.prototype.invokeSavePopup = function (message) {
        var toast = this.toast.create({
            message: message,
            duration: 3000,
            position: 'top',
        });
        toast.present();
    };
    Issuetypes.prototype.toggleItemFlag = function (roomID, itemID, itemName, addFlag) {
        console.log(roomID, itemID, itemName, addFlag);
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        if (addFlag) {
            console.log('added flag to structures');
            this.dataProvider.issueStructure._flagsList.push(itemID);
            this.dataProvider.roomStructure[roomID].data.flagsList.push(itemName);
        }
        else {
            console.log('removing flag from structures');
            this.dataProvider.issueStructure._flagsList.splice(this.dataProvider.issueStructure._flagsList.indexOf(itemID), 1);
            this.dataProvider.roomStructure[roomID].data.flagsList.push(this.dataProvider.roomStructure[roomID].data.flagsList.indexOf(itemName), 1);
        }
        this.dataProvider.inspectionData.data[roomID].data[itemID].reportFlag = !this.dataProvider.inspectionData.data[roomID].data[itemID].reportFlag;
        this.dataProvider.currentUnsavedItemData.reportFlag = this.dataProvider.inspectionData.data[roomID].data[itemID].reportFlag;
        this.dataProvider.saveCurrentUnsavedItemData(this.auth.currentUser.username, [roomID], itemID);
        this.invokeSavePopup(itemName + ' was saved in ' + roomID);
    };
    return Issuetypes;
}());
Issuetypes = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-issuetypes',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/issuetypes/issuetypes.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title><img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile"></ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid>\n    <ion-row class="page-nav">\n      <ion-col>\n        <p class="negative-margin">\n          <a (click)="showAdminDataPage()" class="clickable-element">\n            <ion-icon name="arrow-back"></ion-icon> Overall Report</a>\n        </p>\n        <h2 class="page-header">{{unit.name}}</h2>\n        <p class="inspector negative-margin">Issue Types</p>\n      </ion-col>\n    </ion-row>\n\n\n    <ion-row class="donut-header">\n      <ion-col col-6 col-md-3 class="donut-side">\n        <ion-row>\n          <canvas baseChart [data]="[(dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count),(10- (dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count))]" [chartType]="\'doughnut\'" [colors]="dataProvider.hospitalityStructure.chartColors"\n            [options]="topDoughnutChart.options"></canvas>\n          <div class="inside-donut">\n            <h2>\n                {{dataProvider.hospitalityStructure.intPortion}}<span class="decimals">{{dataProvider.hospitalityStructure.remainderPortion}}</span>\n                <span class="label">Hospitality<br />Score</span>\n              </h2>\n          </div>\n          <h4>{{dataProvider.hospitalityStructure.unitClassification}}</h4>\n        </ion-row>\n        <ion-row>\n          <p class="word-cloud">\n            <span *ngFor="let tagName of dataProvider.issueStructure._tagHighestArray; let i=index" [style.font-size]="((dataProvider.issueStructure._tagHighestArray.length - i)/2 + 1)+\'em\'">\n                {{tagName}}\n                <br/>\n              </span>\n          </p>\n        </ion-row>\n      </ion-col>\n      <ion-col col-12 col-md-9>\n        <ion-row>\n          <ion-col col-12 col-md-11 offset-1>\n            <ion-row>\n              <ion-col class="align-right" col-6 col-md-5>\n                <h3>{{ dataProvider.issueStructure._itemsInspectedCount }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">Items<br />Inspected</p>\n              </ion-col>\n            </ion-row>\n            <ion-row class="reports-inspected">\n              <ng-container *ngFor="let issueID of dataProvider.issueStructure[\'_keys\']">\n                <ion-col class="inspection-items" col-2>\n\n\n\n                  <h3>{{ dataProvider.issueStructure[issueID].count }}</h3>\n                  <p>{{issueID}}<br /><span> {{ dataProvider.issueStructure[issueID].timelineText }}</span></p>\n\n\n                </ion-col>\n              </ng-container>\n            </ion-row>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col col-6>\n            <ion-row>\n              <ion-col col-6 class="align-right">\n                <h3>{{ dataProvider.issueStructure._total }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">Issues<br />Found</p>\n              </ion-col>\n            </ion-row>\n\n          </ion-col>\n          <ion-col col-6>\n            <ion-row>\n              <ion-col col-6 class="align-right">\n                <h3>{{ dataProvider.issueStructure._flagsList.length }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">Flagged<br />Items</p>\n              </ion-col>\n\n            </ion-row>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n                <ul>\n                  <ng-container *ngFor="let category of sortedFlaggedItemCategories; let i = index;">\n                    <li *ngIf="category.count !== 0" [ngClass]="{ \'highest\': i === 0 }">{{ category.count }}</li>\n                  </ng-container>\n                </ul>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <ul>\n                  <ng-container *ngFor="let category of sortedFlaggedItemCategories; let i = index;">\n                    <li *ngIf="category.count !== 0" [ngClass]="{ \'highest\': i === 0 }">{{ category.category }}</li>\n                  </ng-container>\n                </ul>\n              </ion-col>\n            </ion-row>\n\n          </ion-col>\n        </ion-row>\n      </ion-col>\n    </ion-row>\n\n    <ng-container *ngFor="let issueID of issueStructure[\'_keys\']">\n      <ion-list class="reporting-page" *ngIf="issueStructure[issueID] && issueStructure[issueID].roomItemKeysObjs && issueStructure[issueID].roomItemKeysObjs.length">\n        <ion-row>\n          <ion-col class="content-max-width room-list">\n            <ion-row>\n              <h2 class="room-header">{{issueID}}</h2>\n            </ion-row>\n            <ion-row>\n              <ion-col class="table">\n                <ion-row class="table-header">\n                  <ion-col col-5 col-md-2>\n                    <div class="list-header" item-left>\n                      Room\n                    </div>\n                  </ion-col>\n                  <ion-col col-1>\n                    <div class="list-header" item-left>\n                      Rating\n                    </div>\n                  </ion-col>\n                  <ion-col col-6 col-md-2>\n                    <div class="list-header" item-left>\n                      Room\n                    </div>\n                  </ion-col>\n                  <ion-col col-6 col-md-3>\n                    <div class="list-header" item-left>\n                      Comments\n                    </div>\n                  </ion-col>\n                  <ion-col col-6 col-md-2>\n                  </ion-col>\n                  <ion-col col-6 col-md-2>\n                  </ion-col>\n                </ion-row>\n\n                <ng-container *ngFor="let roomItemObj of issueStructure[issueID].roomItemKeysObjs">\n                  <ion-row *ngIf="!inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].naChoice"\n                           class="row">\n                    <!--TODO cell additional styling needed?-->\n\n\n\n\n\n                    <!--<div class="cell col1">\n                    <ion-icon name="ios-alert"\n                              *ngIf="dataProvider.issueStructure[\'_problemKeyDict\'][inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].inspectionWorkTrackingConditions.selection]">\n                    </ion-icon>\n                  </div>-->\n\n                    <ion-col col-5 col-md-2>\n                      <p>{{inspectionTemplate.data[roomItemObj.roomID].data[roomItemObj.itemID].Item}}</p>\n                    </ion-col>\n                    <ion-col col-1>\n                      <p>{{inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].hospitalityRating}}</p>\n                    </ion-col>\n                    <ion-col col-6 col-md-2>\n                      <p>\n                        <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[roomItemObj.roomID]">\n                        {{dataProvider.inspectionTemplate.roomAliases[roomItemObj.roomID]}}\n                      </span>\n                        <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[roomItemObj.roomID]">\n                        {{roomItemObj.roomID}}\n                      </span>\n                      </p>\n                    </ion-col>\n                    <!--<div *ngIf="inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].inspectionWorkTrackingConditions" class="cell col4">\n                    {{inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].inspectionWorkTrackingConditions.selection}}\n                  </div>-->\n                    <ion-col col-6 col-md-3>\n                      <ng-container *ngIf="!inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].mergedComments">\n                        <p *ngFor="let commentKey of roomItemObj.commentKeys">\n                          {{inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].comments[commentKey].text}}\n                        </p>\n                      </ng-container>\n                      <ng-container *ngIf="inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].mergedComments">\n                        <p>{{inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].mergedComments}}</p>\n                      </ng-container>\n                    </ion-col>\n                    <ion-col col-6 col-md-2 class="button lightest-purple">\n                      <button class="light-purple" ion-button (click)="toggleItemFlag(roomItemObj.roomID, roomItemObj.itemID, inspectionTemplate.data[roomItemObj.roomID].data[roomItemObj.itemID].Item, !inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID][\'reportFlag\']); $event.stopPropagation()"><ion-icon\n                      name="flag"\n                      [ngStyle]="{\'color\':inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID][\'reportFlag\'] ? \'red\' : \'gray\' }">\n                    </ion-icon>\n                  </button>\n                    </ion-col>\n                    <ion-col col-6 col-md-2 class="button light-purple">\n                      <button class="button button button-default" ion-button *ngIf="inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].markSectionComplete && !inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].naChoice" text-wrap (click)="toggleItemDetails(roomItemObj.itemID)"\n                        [ngClass]="{active: isItemDetailShown(roomItemObj.itemID)}">\n                    <ion-icon color="success" item-right [name]="isItemDetailShown(roomItemObj.itemID) ? \'arrow-dropdown\' : \'arrow-dropright\'">\n                    </ion-icon>\n                  </button>\n                    </ion-col>\n                    <ion-row class="details" *ngIf="isItemDetailShown(roomItemObj.itemID)">\n\n                      <ion-col col-6 col-md-4 *ngFor="let conditionObj of roomItemObj.typeConditionKeys">\n                        <p><strong>{{conditionObj._id}}</strong></p>\n                        <ng-container *ngFor="let optionKey of conditionObj.optionKeys">\n                          <p *ngIf="inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].typesConditions[conditionObj._id][optionKey].checkboxValue || inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].typesConditions[conditionObj._id][optionKey].textValue">\n                            <span class="label">{{ dataProvider.getOptionTemplateFromID(conditionObj._id, optionKey)?.subLabel }}</span> {{ dataProvider.getOptionTemplateFromID(conditionObj._id, optionKey)?.optionName }}\n                            <span *ngIf="inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].typesConditions[conditionObj._id][optionKey].textValue">\n                        : {{ inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].typesConditions[conditionObj._id][optionKey].textValue }}\n                      </span>\n                          </p>\n                        </ng-container>\n                      </ion-col>\n                      <ng-container *ngIf="roomItemObj.imageKeys.length > 0">\n                        <ng-container *ngFor="let imageID of roomItemObj.imageKeys">\n                          <ion-col col-4 col-md-3 *ngIf="inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].images[imageID].thumb400">\n                            <p>\n                              <img width="100%" height="auto" [src]="inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].images[imageID].thumb400" />\n                            </p>\n                          </ion-col>\n                          <ion-col col-4 col-md-3 *ngIf="!(inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].images[imageID].thumb400) && inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].images[imageID].localOrigURI">\n                            <p>\n                              <img width="100%" height="auto" [src]="dataProvider.fileURIasSrc(inspectionData.data[roomItemObj.roomID].data[roomItemObj.itemID].images[imageID].localOrigURI)" />\n                            </p>\n                          </ion-col>\n                        </ng-container>\n                      </ng-container>\n\n                    </ion-row>\n\n                  </ion-row>\n                </ng-container>\n              </ion-col>\n            </ion-row>\n          </ion-col>\n        </ion-row>\n      </ion-list>\n    </ng-container>\n\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/issuetypes/issuetypes.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* PopoverController */], __WEBPACK_IMPORTED_MODULE_3__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_4__providers_auth_service__["a" /* AuthService */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["m" /* ToastController */]])
], Issuetypes);

//# sourceMappingURL=issuetypes.js.map

/***/ }),

/***/ 410:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SuperDataPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__inspectioncreator_inspectioncreator__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__superdatadrilldown_unittype_unittype__ = __webpack_require__(411);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__superdatadrilldown_byunit_byunit__ = __webpack_require__(412);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var SuperDataPage = (function () {
    function SuperDataPage(navCtrl, dataProvider, loadingCtrl, navParams) {
        this.navCtrl = navCtrl;
        this.dataProvider = dataProvider;
        this.loadingCtrl = loadingCtrl;
        this.navParams = navParams;
        this.allInspectionIDs = {};
        this.doughnutChartSettings = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "75",
                aspectRatio: 1
            }
        };
        // Starting here with refactor variables
        this.accountOverallIssueTypeCounts = {};
        this.accountOverallItemsInspected = 0;
        this.accountSortedRoomScores = [];
        this.accountScoreCategories = {
            Luxury: 0,
            Deluxe: 0,
            Standard: 0,
            Budget: 0,
            NA: 0
        };
        this.accountOverallScoreSum = 0;
        this.accountPotentialRevenue = 0;
        this.accountTotalFlags = 0;
        this.accountTotalProjects = 0;
        this.accountSortedUnitScores = [];
        this.dataByTemplate = {};
        this.dataByRoom = {};
        this.accountZenSortedArrays = {};
        this.accountFlagCategoriesSortedCounts = [];
        //--------
        this.overallAccountScore = {
            count: 0,
            sum: 0,
            intPortion: 0,
            remainderPortion: 0
        };
        this.totalUnits = 0;
        this.scoreCategories = {
            Luxury: 0,
            Deluxe: 0,
            Standard: 0,
            Budget: 0,
            NA: 0
        };
        this.unitHospRatings = [];
        this.unitTypeInfo = [];
        this.roomTypeInfo = [];
        this.totalFlagCount = 0;
        this.sortedFlaggedItemCategories = [];
        this.issueCategories = {};
        this.unitZenCounts = [];
        this.unitZenPercent = [];
        this.potentialRevenue = 0;
        this.revenueByUnits = [];
        this.projectsWorthStarting = null;
        this.accountUnitsSortedByRevenue = [];
    }
    SuperDataPage.prototype.ionViewDidLoad = function () {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        this.loading.present();
        this.accountOverallIssueTypeCounts = this.navParams.get('accountOverallIssueTypeCounts');
        this.accountOverallItemsInspected = this.navParams.get('accountOverallItemsInspected');
        this.accountScoreCategories = this.navParams.get('accountScoreCategories');
        this.accountOverallScoreSum = this.navParams.get('accountOverallScoreSum');
        this.accountPotentialRevenue = this.navParams.get('accountPotentialRevenue');
        this.accountTotalFlags = this.navParams.get('accountTotalFlags');
        this.accountTotalProjects = this.navParams.get('accountTotalProjects');
        this.accountSortedUnitScores = this.navParams.get('accountSortedUnitScores');
        this.dataByTemplate = this.navParams.get('dataByTemplate');
        this.dataByRoom = this.navParams.get('dataByRoom');
        this.accountSortedRoomScores = this.navParams.get('accountSortedRoomScores');
        this.accountZenSortedArrays = this.navParams.get('accountZenSortedArrays');
        this.accountFlagCategoriesSortedCounts = this.navParams.get('accountFlagCategoriesSortedCounts');
        this.accountUnitsSortedByRevenue = this.navParams.get('accountUnitsSortedByRevenue');
        // console.log('this.navParams', this.navParams);
        /*this.overallAccountScore = this.navParams.get('overallAccountScore');
        this.totalUnits = this.navParams.get('totalUnits');
        this.scoreCategories = this.navParams.get('scoreCategories');
        this.issueCategories = this.navParams.get('issueCategories');
        this.potentialRevenue = this.navParams.get('potentialRevenue');
        this.projectsWorthStarting = this.navParams.get('projectsWorthStarting');
    
        this.totalFlagCount = this.navParams.get('totalFlagCount');
        this.sortedFlaggedItemCategories = this.navParams.get('sortedFlaggedItemCategories');
    
        this.revenueByUnits = this.navParams.get('revenueByUnits');
        this.revenueByUnits.sort((a, b) => { return b.potentialRevenue - a.potentialRevenue; });
    
        this.unitZenCounts = this.navParams.get('unitZenCounts');
        this.unitZenCounts.sort((a, b) => { return b.count - a.count; });
        this.unitZenPercent = this.unitZenCounts.slice().sort((a, b) => { return b.percentage - a.percentage; });
    
        this.unitHospRatings = this.navParams.get('unitHospRatings');
        this.unitHospRatings.sort((a, b) => { return b.score - a.score; });
        this.unitTypeInfo = this.navParams.get('unitTypeInfo');
        this.unitTypeInfo.sort((a, b) => { return b.score - a.score; });
    
        // sort and removed any rooms with score of zero
        this.roomTypeInfo = this.navParams.get('roomTypeInfo');
        this.roomTypeInfo.sort((a, b) => { return b.score - a.score; });
        this.roomTypeInfo = this.roomTypeInfo.filter(a => a.score !== 0);
    
        console.log('this.navParams', this.navParams)*/
        this.loading.dismiss();
    };
    SuperDataPage.prototype.showInspectionCreatorPage = function (unit) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__inspectioncreator_inspectioncreator__["a" /* InspectionCreatorPage */], { unit: unit }, { animate: true, direction: 'forward' });
    };
    SuperDataPage.prototype.showUnitTypeDrillDownPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__superdatadrilldown_unittype_unittype__["a" /* UnitTypePage */], {
            dataByTemplate: this.dataByTemplate
        }, { animate: true, direction: 'forward' });
    };
    SuperDataPage.prototype.showByUnitDrillDownPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_5__superdatadrilldown_byunit_byunit__["a" /* ByUnitPage */], {}, { animate: true, direction: 'forward' });
    };
    return SuperDataPage;
}());
SuperDataPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-superdata',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdata/superdata.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title>\n      <img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile">\n    </ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid>\n    <ion-row class="page-nav">\n      <ion-col col-6>\n        <h2 class="page-header">Brand Hospitality Score</h2>\n        <p class="negative-margin" *ngIf="dataProvider.allUnits.data.length > 0">Based on saved report data</p>\n        <p class="negative-margin" *ngIf="(dataProvider.allUnits.data.length === 0) && dataProvider.emptyUnitList">\n          Add a unit on the admin page to get started.\n        </p>\n      </ion-col>\n    </ion-row>\n    <ion-row class="donut-header">\n      <ion-col col-6 col-md-3 class="donut-side">\n        <div *ngIf="accountOverallScoreSum" class="graph">\n          <canvas baseChart [data]="[(accountOverallScoreSum / accountSortedUnitScores.length),(10 - (accountOverallScoreSum / accountSortedUnitScores.length))]" [chartType]="\'doughnut\'" [colors]="dataProvider.hospitalityStructure.chartColors" [options]="doughnutChartSettings.options"></canvas>\n          <div class="inside-donut">\n            <h2>\n              {{ (accountOverallScoreSum / accountSortedUnitScores.length) | number:\'1.2-2\' }}\n              <!--<span class="decimals">{{ overallAccountScore.remainderPortion }}</span>-->\n              <span class="label">Average Score</span>\n            </h2>\n          </div>\n        </div>\n      </ion-col>\n      <ion-col col-6 col-md-3>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <h3>{{ dataProvider.allUnits.data.length }}</h3>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <p class="number-label">Units</p>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <ul>\n              <li class="highest">{{accountScoreCategories[\'Luxury\']}}</li>\n              <li class="">{{accountScoreCategories[\'Deluxe\']}}</li>\n              <li class="">{{accountScoreCategories[\'Standard\']}}</li>\n              <li class="">{{accountScoreCategories[\'Budget\']}}</li>\n              <li class="">{{accountScoreCategories[\'NA\']}}</li>\n            </ul>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <ul>\n              <li class="highest">Luxury</li>\n              <li class="">Deluxe</li>\n              <li class="">Standard</li>\n              <li class="">Budget</li>\n              <li class="">Not scored</li>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <ion-col col-6 col-md-3>\n        <ion-row>\n          <ion-col>\n            <h4>HIGHEST</h4>\n            <p class="number-label">Unit</p>\n            <ul class="ul-margin" *ngIf="accountSortedUnitScores.length">\n              <li><span class="list-score">{{accountSortedUnitScores[0].score | number:\'1.2-2\'}}</span> <span class="list-room"> {{accountSortedUnitScores[0].name}}</span></li>\n              <li *ngIf="accountSortedUnitScores.length > 1">\n                <span class="list-score">{{accountSortedUnitScores[1].score | number:\'1.2-2\'}} </span> <span class="list-room">{{accountSortedUnitScores[1].name}}</span>\n              </li>\n              <li *ngIf="accountSortedUnitScores.length > 2">\n                <span class="list-score">{{accountSortedUnitScores[2].score | number:\'1.2-2\'}} </span> <span class="list-room">{{accountSortedUnitScores[2].name}}</span>\n              </li>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <ion-col col-6 col-md-3>\n        <ion-row>\n          <ion-col>\n            <h4>LOWEST</h4>\n            <p class="number-label">Unit</p>\n            <ul class="ul-margin" *ngIf="accountSortedUnitScores.length > 3">\n              <li>\n                <span class="list-score">{{accountSortedUnitScores[accountSortedUnitScores.length-1].score | number:\'1.2-2\'}}</span> <span class="list-room">\n                {{accountSortedUnitScores[accountSortedUnitScores.length-1].name}}</span>\n              </li>\n              <li *ngIf="accountSortedUnitScores.length > 4">\n                <span class="list-score">{{accountSortedUnitScores[accountSortedUnitScores.length-2].score | number:\'1.2-2\'}}</span> <span class="list-room">\n                {{accountSortedUnitScores[accountSortedUnitScores.length-2].name}}</span>\n              </li>\n              <li *ngIf="accountSortedUnitScores.length > 5">\n                <span class="list-score">{{accountSortedUnitScores[accountSortedUnitScores.length-3].score | number:\'1.2-2\'}}</span> <span class="list-room">\n                {{accountSortedUnitScores[accountSortedUnitScores.length-3].name}}</span>\n              </li>\n            </ul>\n            <button ion-button class="light-purple button float-right" (click)="showByUnitDrillDownPage()">Unit Report</button>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n\n    </ion-row>\n    <ion-row class="donut-header">\n      <ion-col col-0 col-md-3 class="donut-side">\n      </ion-col>\n      <ion-col col-12 col-md-9>\n        <ion-row>\n          <ion-col>\n            <!-- Placeholder -->\n            <h4>UNIT TYPE</h4>\n            <div class="table no-bottom-border">\n              <ion-row class="table-header">\n                <ion-col col-6 col-md-4>\n                  <div class="list-header" item-left>\n\n                  </div>\n                </ion-col>\n                <ion-col col-3 col-md-2>\n                  <div class="list-header" item-left>\n                    QTY\n                  </div>\n                </ion-col>\n                <ion-col col-3 col-md-2>\n                  <div class="list-header" item-left>\n                    SCORE\n                  </div>\n                </ion-col>\n                <ion-col col-6 col-md-2>\n                </ion-col>\n                <ion-col col-6 col-md-2>\n                </ion-col>\n              </ion-row>\n              <ion-row *ngFor="let template of dataProvider.templateChoices">\n                <ion-col col-6 col-md-4>\n                  <ul class="super-data-list">\n                    <li>{{template.displayName}} </li>\n                  </ul>\n                </ion-col>\n                <ion-col col-3 col-md-2>\n                  <ul class="super-data-list">\n                    <li> {{dataByTemplate[template.displayName]?.overallCount}} </li>\n                  </ul>\n                </ion-col>\n                <ion-col col-3 col-md-2>\n                  <ul class="super-data-list">\n                    <li *ngIf="dataByTemplate[template.displayName]?.scores.length">\n                      {{dataByTemplate[template.displayName].overallSum / dataByTemplate[template.displayName].scores.length | number:\'1.2-2\'}}\n                    </li>\n                  </ul>\n                </ion-col>\n              </ion-row>\n            </div>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <ion-col col-12 class="button-only-column">\n        <button ion-button class="light-purple button float-right" (click)="showUnitTypeDrillDownPage()">Program Report</button>\n      </ion-col>\n    </ion-row>\n    <ion-row class="donut-header">\n      <ion-col col-0 col-md-3 class="donut-side">\n      </ion-col>\n      <ion-col col-12 col-md-9>\n\n        <ion-row>\n          <ion-col col-12 col-md-6>\n            <!-- Placeholder -->\n            <h4>ROOM</h4>\n            <p class="number-label">HIGHEST</p>\n            <ul class="ul-margin" *ngIf="accountSortedRoomScores.length">\n              <li>\n                <span class="list-score">{{accountSortedRoomScores[0].score | number:\'1.2-2\'}}\n                  </span> <span class="list-room">\n                {{accountSortedRoomScores[0].roomName}}\n                {{accountSortedRoomScores[0].unitName}}</span>\n              </li>\n              <li *ngIf="accountSortedRoomScores.length > 1">\n                <span class="list-score">{{accountSortedRoomScores[1].score | number:\'1.2-2\'}}\n                </span> <span class="list-room">\n                {{accountSortedRoomScores[1].roomName}}\n                {{accountSortedRoomScores[1].unitName}}</span>\n              </li>\n              <li *ngIf="accountSortedRoomScores.length > 2">\n                <span class="list-score">{{accountSortedRoomScores[2].score | number:\'1.2-2\'}}\n                </span> <span class="list-room">\n                {{accountSortedRoomScores[2].roomName}}\n                {{accountSortedRoomScores[2].unitName}}</span>\n              </li>\n            </ul>\n          </ion-col>\n\n          <ion-col col-12 col-md-6>\n            <!-- Placeholder -->\n            <h4>&nbsp;</h4>\n            <p class="number-label">LOWEST</p>\n            <ul class="ul-margin" *ngIf="accountSortedRoomScores.length > 3">\n              <li>\n              <span class="list-score">  {{accountSortedRoomScores[accountSortedRoomScores.length-1].score | number:\'1.2-2\'}}\n                </span> <span class="list-room">\n                {{accountSortedRoomScores[accountSortedRoomScores.length-1].roomName}}\n                {{accountSortedRoomScores[accountSortedRoomScores.length-1].unitName}}</span>\n              </li>\n              <li *ngIf="accountSortedRoomScores.length > 4">\n                <span class="list-score">{{accountSortedRoomScores[accountSortedRoomScores.length-2].score | number:\'1.2-2\'}}\n                </span> <span class="list-room">\n                {{accountSortedRoomScores[accountSortedRoomScores.length-2].roomName}}\n                {{accountSortedRoomScores[accountSortedRoomScores.length-2].unitName}}</span>\n              </li>\n              <li *ngIf="accountSortedRoomScores.length > 5">\n                <span class="list-score">{{accountSortedRoomScores[accountSortedRoomScores.length-3].score | number:\'1.2-2\'}}\n                </span> <span class="list-room">\n                {{accountSortedRoomScores[accountSortedRoomScores.length-3].roomName}}\n                {{accountSortedRoomScores[accountSortedRoomScores.length-3].unitName}}</span>\n              </li>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <!-- Not yet implemented\n      <ion-col col-12 class="button-only-column">\n        <button ion-button class="light-purple button float-right">Room Data</button>\n      </ion-col>-->\n    </ion-row>\n    <ion-row class="donut-header">\n      <ion-col>\n        <ion-row>\n          <h2 class="page-header">GUEST HAPPINESS</h2>\n        </ion-row>\n        <ion-row>\n          <ion-col col-6 col-md-3>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n                <h3>{{ accountOverallItemsInspected }}</h3>\n              </ion-col>\n              <ion-col class="align-left" col>\n                <p class="number-label">ITEMS\n                  <br />INSPECTED</p>\n              </ion-col>\n            </ion-row>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n\n                <ul class="ul-margin">\n                  <li class="highest">{{ accountOverallIssueTypeCounts[\'Urgent\'] }}</li>\n                  <li>{{ accountOverallIssueTypeCounts[\'Serious\'] }} </li>\n                  <li>{{ accountOverallIssueTypeCounts[\'Immediate\'] }} </li>\n                  <li>{{ accountOverallIssueTypeCounts[\'Delayed\'] }} </li>\n                  <li>{{ accountOverallIssueTypeCounts[\'Zen\'] }} </li>\n                </ul>\n              </ion-col>\n              <ion-col class="align-left" col>\n\n\n\n                <ul class="ul-margin">\n                  <li class="highest">Urgent</li>\n                  <li>Serious</li>\n                  <li>Immediate</li>\n                  <li>Delayed</li>\n                  <li>Zen</li>\n                </ul>\n              </ion-col>\n            </ion-row>\n          </ion-col>\n          <ion-col col-6 col-md-6>\n\n    <ion-row>\n      <ion-col>\n              <h4>Zen Champions</h4>\n              <h4 class="zen-sub">\n                <ng-container *ngIf="accountSortedUnitScores.length">\n                  {{ accountOverallIssueTypeCounts[\'Zen\'] / accountSortedUnitScores.length | number:\'1.0-0\' }}\n                </ng-container>\n                <small>ZEN per unit</small>\n              </h4>\n            </ion-col>\n      </ion-row>\n      <ion-row>\n              <ion-col class="align-left" col-6>\n\n                <p class="number-label">By Count</p>\n                <ul class="ul-margin" *ngIf="accountZenSortedArrays.counts && accountZenSortedArrays.counts.length">\n                  <li>\n                    <span class="list-score">{{accountZenSortedArrays.counts[0].zenCount}}\n                    </span> <span class="list-room">{{accountZenSortedArrays.counts[0].unitName}}</span>\n                  </li>\n                  <li *ngIf="accountZenSortedArrays.counts.length > 1">\n                    <span class="list-score">{{accountZenSortedArrays.counts[1].zenCount}}\n                    </span> <span class="list-room">{{accountZenSortedArrays.counts[1].unitName}}</span>\n                  </li>\n                  <li *ngIf="accountZenSortedArrays.counts.length > 2">\n                    <span class="list-score">{{accountZenSortedArrays.counts[2].zenCount}}\n                    </span> <span class="list-room">{{accountZenSortedArrays.counts[2].unitName}}</span>\n                  </li>\n                </ul>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">By Percentage</p>\n                <ul class="ul-margin" *ngIf="accountZenSortedArrays.percents && accountZenSortedArrays.percents.length">\n                  <li>\n                    <span class="list-score">{{accountZenSortedArrays.percents[0].zenPercent | percent:\'1.0-0\'}}\n                    </span> <span class="list-room">{{accountZenSortedArrays.percents[0].unitName}}</span>\n                  </li>\n                  <li *ngIf="accountZenSortedArrays.percents.length > 1">\n                    <span class="list-score">{{accountZenSortedArrays.percents[1].zenPercent | percent:\'1.0-0\'}}\n                    </span> <span class="list-room">{{accountZenSortedArrays.percents[1].unitName}}</span>\n                  </li>\n                  <li *ngIf="accountZenSortedArrays.percents.length > 2">\n                  <span class="list-score">  {{accountZenSortedArrays.percents[2].zenPercent | percent:\'1.0-0\'}}\n                  </span> <span class="list-room">  {{accountZenSortedArrays.percents[2].unitName}}</span>\n                  </li>\n                </ul>\n              </ion-col>\n            </ion-row>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n    </ion-row>\n    <!-- Not yet implemented\n    <ion-row class="donut-header">\n      <ion-col class="text-align-right">\n        <button ion-button class="light-purple">Inspection Items</button>\n      </ion-col>\n    </ion-row>-->\n    <ion-row class="donut-header">\n      <ion-col>\n        <ion-row>\n          <ion-col>\n          <h2 class="page-header">POTENTIAL REVENUE</h2>\n            <h3 class="potential-revenue">{{accountPotentialRevenue | currency:\'USD\':true:\'1.0-0\' }}</h3>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col col-6 col-md-3>\n\n            <ion-row>\n              <ion-col class="align-right" col-6>\n\n                <ul *ngIf="accountUnitsSortedByRevenue.length">\n                  <li>{{accountUnitsSortedByRevenue[0].potentialRevenue | currency:\'USD\':true:\'1.0-0\'}}\n                  </li>\n                  <li *ngIf="accountUnitsSortedByRevenue.length > 1 && accountUnitsSortedByRevenue[1].potentialRevenue !== 0">\n                    {{accountUnitsSortedByRevenue[1].potentialRevenue | currency:\'USD\':true:\'1.0-0\'}}\n                  </li>\n                  <li *ngIf="accountUnitsSortedByRevenue.length > 2 && accountUnitsSortedByRevenue[2].potentialRevenue !== 0">\n                    {{accountUnitsSortedByRevenue[2].potentialRevenue | currency:\'USD\':true:\'1.0-0\'}}\n                  </li>\n                </ul>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n\n                <ul  *ngIf="accountUnitsSortedByRevenue.length">\n                  <li>{{accountUnitsSortedByRevenue[0].unit}}\n                  </li>\n                  <li *ngIf="accountUnitsSortedByRevenue.length > 1 && accountUnitsSortedByRevenue[1].potentialRevenue !== 0">\n                    {{accountUnitsSortedByRevenue[1].unit}}\n                  </li>\n                  <li *ngIf="accountUnitsSortedByRevenue.length > 2 && accountUnitsSortedByRevenue[2].potentialRevenue !== 0">\n                    {{accountUnitsSortedByRevenue[2].unit}}\n                  </li>\n                </ul>\n              </ion-col>\n            </ion-row>\n          </ion-col>\n          <ion-col col-6 col-md-3>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n                <h3>{{ accountTotalFlags }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">FLAGGED <br />ITEMS</p>\n\n              </ion-col>\n            </ion-row>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n\n                <ul  *ngIf="accountFlagCategoriesSortedCounts.length">\n                  <li>{{accountFlagCategoriesSortedCounts[0].count}}\n                  </li>\n                  <li *ngIf="accountFlagCategoriesSortedCounts.length > 1">\n                    {{accountFlagCategoriesSortedCounts[1].count}}\n                  </li>\n                  <li *ngIf="accountFlagCategoriesSortedCounts.length > 2">\n                    {{accountFlagCategoriesSortedCounts[2].count}}\n                  </li>\n                </ul>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n\n                <ul *ngIf="accountFlagCategoriesSortedCounts.length">\n                  <li>{{accountFlagCategoriesSortedCounts[0].category}}\n                  </li>\n                  <li *ngIf="accountFlagCategoriesSortedCounts.length > 1">\n                    {{accountFlagCategoriesSortedCounts[1].category}}\n                  </li>\n                  <li *ngIf="accountFlagCategoriesSortedCounts.length > 2">\n                    {{accountFlagCategoriesSortedCounts[2].category}}\n                  </li>\n                </ul>\n              </ion-col>\n            </ion-row>\n          </ion-col>\n          <ion-col col-6 col-md-3>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n                  <h3>{{ accountTotalProjects }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">PROJECTS WORTH <br />STARTING</p>\n\n\n              </ion-col>\n            </ion-row>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n\n                    <h3>{{ accountTotalProjects / dataProvider.allUnits.data.length | number:\'1.0-0\' }}</h3>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n\n\n                <p class="number-label">AVERAGE <br />PER UNIT</p>\n              </ion-col>\n            </ion-row>\n          </ion-col>\n        </ion-row>\n\n\n\n\n\n      </ion-col>\n    </ion-row>\n    <!-- Not yet implemented\n    <ion-row class="donut-header">\n      <ion-col class="text-align-right">\n        <button ion-button class="light-purple">Project Data</button>\n      </ion-col>\n    </ion-row>-->\n    <div class="reporting-selection table">\n      <!-- This isn\'t needed on this page right?\n      <ion-row *ngIf="dataProvider.allUnits.data.length > 0" class="table-header">\n        <ion-col col-6 col-md-4>\n          <div class="list-header" item-left>\n            Unit\n          </div>\n        </ion-col>\n        <ion-col col-3 col-md-2>\n          <div class="list-header" item-left>\n            Activity\n          </div>\n        </ion-col>\n        <ion-col col-3 col-md-2>\n          <div class="list-header" item-left>\n            Next Inspection\n          </div>\n        </ion-col>\n        <ion-col col-6 col-md-2>\n        </ion-col>\n        <ion-col col-6 col-md-2>\n        </ion-col>\n      </ion-row>\n\n      <ion-row *ngFor="let unit of dataProvider.allUnits.data">\n        <ion-col tappable col-6 col-md-4 (click)="showInspectionCreatorPage(unit)">\n          <p class="unit-name">{{unit.name}}</p>\n          <p>{{unit.unitTemplate.displayName}}</p>\n        </ion-col>\n        <ion-col col-3 col-md-2>\n\n        </ion-col>\n        <ion-col col-3 col-md-2>\n          <p>{{getNextInspecDate(unit._id) | date:\'MMM y\'}}</p>\n        </ion-col>\n        <ion-col class="button" col-6 col-md-2>\n          <button class="light-purple" ion-button type="submit">\n            <img src="assets/icon/inspection.png" alt="Magnifying glass">\n          </button>\n        </ion-col>\n        <ion-col class="button" col-6 col-md-2>\n          <button ion-button type="submit">\n            <img src="assets/icon/report-writing.png" alt="Report Writing">\n          </button>\n        </ion-col>\n      </ion-row>-->\n\n      <ion-row *ngIf="(dataProvider.allUnits.data.length === 0) && !dataProvider.emptyUnitList">\n        <ion-col>\n          <ion-spinner></ion-spinner>\n        </ion-col>\n      </ion-row>\n    </div>\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdata/superdata.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_3__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */]])
], SuperDataPage);

//# sourceMappingURL=superdata.js.map

/***/ }),

/***/ 411:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UnitTypePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var UnitTypePage = (function () {
    function UnitTypePage(navCtrl, dataProvider, navParams) {
        this.navCtrl = navCtrl;
        this.dataProvider = dataProvider;
        this.navParams = navParams;
        this.doughnutChartSettings = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "75",
                aspectRatio: 1
            }
        };
        this.units = [];
        this.dataByTemplate = {};
    }
    UnitTypePage.prototype.ionViewDidLoad = function () {
        this.dataByTemplate = this.navParams.get('dataByTemplate');
    };
    UnitTypePage.prototype.showSuperDataPage = function () {
        this.navCtrl.pop();
    };
    return UnitTypePage;
}());
UnitTypePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-superdatadrilldown',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdatadrilldown/unittype/unittype.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title>\n      <img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile">\n    </ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid>\n    <ion-row class="page-nav">\n      <ion-col col-6>\n        <p class="negative-margin">\n          <a (click)="showSuperDataPage()" class="clickable-element">\n            <ion-icon name="arrow-back"></ion-icon> All Data</a>\n        </p>\n        <h2 class="page-header opacity75">Program Hospitality Score</h2>\n        <h3 class="page-header">Program Report</h3>\n      </ion-col>\n    </ion-row>\n   <ng-container *ngFor="let template of dataProvider.templateChoices">\n     <ion-row>\n         <h4>{{ template.displayName }}</h4>\n      </ion-row>\n    <ion-row class="donut-header">\n\n      <ion-col col-6 col-md-3 class="donut-side">\n        <div *ngIf="dataByTemplate[template.displayName]?.scores.length" class="graph">\n          <canvas baseChart [data]="[(dataByTemplate[template.displayName]?.overallSum / dataByTemplate[template.displayName].scores.length),(10 - dataByTemplate[template.displayName]?.overallSum / dataByTemplate[template.displayName].scores.length)]"\n            [chartType]="\'doughnut\'" [colors]="dataProvider.hospitalityStructure.chartColors" [options]="doughnutChartSettings.options"></canvas>\n          <div class="inside-donut">\n            <h2>\n              {{dataByTemplate[template.displayName]?.overallSum / dataByTemplate[template.displayName].scores.length | number:\'1.2-2\'}}\n              <span class="label">Unit Hospitality<br /> Score</span>\n            </h2>\n          </div>\n        </div>\n      </ion-col>\n      <ion-col col-6 col-md-3>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <h3>{{ dataByTemplate[template.displayName]?.overallCount }}</h3>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <p class="number-label">Units</p>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col class="align-right" col-6>\n            <ul>\n              <li class="highest">{{dataByTemplate[template.displayName]?.scoreCategories[\'Luxury\']}}</li>\n              <li class="">{{dataByTemplate[template.displayName]?.scoreCategories[\'Deluxe\']}}</li>\n              <li class="">{{dataByTemplate[template.displayName]?.scoreCategories[\'Standard\']}}</li>\n              <li class="">{{dataByTemplate[template.displayName]?.scoreCategories[\'Budget\']}}</li>\n              <li class="">{{dataByTemplate[template.displayName]?.scoreCategories[\'NA\']}}</li>\n            </ul>\n          </ion-col>\n          <ion-col class="align-left" col-6>\n            <ul>\n              <li class="highest">Luxury</li>\n              <li class="">Deluxe</li>\n              <li class="">Standard</li>\n              <li class="">Budget</li>\n              <li class="">Not scored</li>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <ion-col col-6 col-md-3>\n        <ion-row>\n          <ion-col>\n            <h4>HIGHEST</h4>\n            <p class="number-label">Unit</p>\n            <ul class="ul-margin" *ngIf="dataByTemplate[template.displayName]?.scores?.length">\n              <li>\n                {{dataByTemplate[template.displayName]?.scores[0].score | number:\'1.2-2\'}}\n                {{dataByTemplate[template.displayName]?.scores[0].name}}\n              </li>\n              <li *ngIf="dataByTemplate[template.displayName].scores.length > 1">\n                {{dataByTemplate[template.displayName]?.scores[1].score | number:\'1.2-2\'}}\n                {{dataByTemplate[template.displayName]?.scores[1].name}}\n              </li>\n              <li *ngIf="dataByTemplate[template.displayName].scores.length > 2">\n                {{dataByTemplate[template.displayName]?.scores[2].score | number:\'1.2-2\'}}\n                {{dataByTemplate[template.displayName]?.scores[2].name}}\n              </li>\n            </ul>\n          </ion-col>\n        </ion-row>\n      </ion-col>\n      <ion-col col-6 col-md-3>\n        <ion-row>\n          <ion-col>\n            <h4>LOWEST</h4>\n            <p class="number-label">Unit</p>\n            <ul class="ul-margin" *ngIf="dataByTemplate[template.displayName]?.scores?.length">\n              <li *ngIf="dataByTemplate[template.displayName].scores.length > 3">\n                {{dataByTemplate[template.displayName]?.scores[dataByTemplate[template.displayName].scores.length-1].score | number:\'1.2-2\'}}\n                {{dataByTemplate[template.displayName]?.scores[dataByTemplate[template.displayName].scores.length-1].name}}\n              </li>\n              <li *ngIf="dataByTemplate[template.displayName].scores.length > 4">\n                {{dataByTemplate[template.displayName]?.scores[dataByTemplate[template.displayName].scores.length-2].score | number:\'1.2-2\'}}\n                {{dataByTemplate[template.displayName]?.scores[dataByTemplate[template.displayName].scores.length-2].name}}\n              </li>\n              <li *ngIf="dataByTemplate[template.displayName].scores.length > 5">\n                {{dataByTemplate[template.displayName]?.scores[dataByTemplate[template.displayName].scores.length-3].score | number:\'1.2-2\'}}\n                {{dataByTemplate[template.displayName]?.scores[dataByTemplate[template.displayName].scores.length-3].name}}\n              </li>\n            </ul>\n          </ion-col>\n          <!--<button ion-button class="light-purple">View Unit Type</button>-->\n        </ion-row>\n      </ion-col>\n    </ion-row>\n   </ng-container>\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdatadrilldown/unittype/unittype.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */]])
], UnitTypePage);

//# sourceMappingURL=unittype.js.map

/***/ }),

/***/ 412:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ByUnitPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ByUnitPage = (function () {
    function ByUnitPage(navCtrl, dataProvider, navParams) {
        this.navCtrl = navCtrl;
        this.dataProvider = dataProvider;
        this.navParams = navParams;
    }
    ByUnitPage.prototype.ionViewDidLoad = function () {
    };
    ByUnitPage.prototype.showSuperDataPage = function () {
        this.navCtrl.pop();
    };
    return ByUnitPage;
}());
ByUnitPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-byunit',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdatadrilldown/byunit/byunit.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title>\n      <img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile">\n    </ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid>\n    <ion-row class="page-nav">\n      <ion-col col-6>\n        <p class="negative-margin">\n          <a (click)="showSuperDataPage()" class="clickable-element">\n            <ion-icon name="arrow-back"></ion-icon> All Data</a>\n        </p>\n        <h2 class="page-header opacity75">Program Hospitality Score</h2>\n        <h3 class="page-header">Unit Reports</h3>\n      </ion-col>\n    </ion-row>\n    <unit-table [units]="dataProvider.allUnits.data"></unit-table>\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdatadrilldown/byunit/byunit.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */]])
], ByUnitPage);

//# sourceMappingURL=byunit.js.map

/***/ }),

/***/ 413:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AdminPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var AdminPage = (function () {
    function AdminPage(navCtrl, navParams, loadingCtrl, dataProvider, alertCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.loadingCtrl = loadingCtrl;
        this.dataProvider = dataProvider;
        this.alertCtrl = alertCtrl;
        this.newUnit = {
            name: '',
            unitTemplateIndex: 0
        };
    }
    AdminPage.prototype.ionViewDidLoad = function () {
    };
    AdminPage.prototype.presentAlert = function (alertMsg) {
        var alert = this.alertCtrl.create({
            title: 'Warning!',
            subTitle: alertMsg,
            buttons: ['OK']
        });
        alert.present();
    };
    AdminPage.prototype.saveNewUnit = function () {
        var _this = this;
        console.log('Attempting to save new unit');
        if (this.newUnit.name.trim() !== '') {
            var loading_1 = this.loadingCtrl.create({
                content: 'Saving, please wait....'
            });
            loading_1.present();
            // Passing undefined for inspection name to get one created automatically
            // Note that the variable returned for success is an array called results, there will be a returned Unit and a returned Inspection
            var newUnitObj = { name: this.newUnit.name, unitTemplate: this.dataProvider.templateChoices[this.newUnit.unitTemplateIndex] };
            this.dataProvider.createNewUnit(newUnitObj, undefined)
                .then(function (results) {
                console.log('Saved new Unit+Inspection');
                _this.newUnit.name = '';
                _this.newUnit.unitTemplateIndex = 0;
                loading_1.dismiss();
            })
                .catch(function (err) {
                if (err.status === 409 && err.message === 'Document update conflict') {
                    _this.presentAlert('This unit already exists!');
                    _this.newUnit.name = '';
                }
                console.error('Failed to save new unit or inspection');
                loading_1.dismiss();
            });
        }
    };
    ;
    return AdminPage;
}());
AdminPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-admin',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/admin/admin.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title><img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile"></ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid *ngIf="dataProvider.templateChoices">\n    <ion-row class="page-nav">\n      <ion-col>\n        <h2 class="page-header">Admin</h2>\n        <p class="negative-margin">Add units and manage settings</p>\n      </ion-col>\n    </ion-row>\n    <ion-row class="page-nav">\n      <ion-col>\n        <h3>Create Unit</h3>\n          <ion-label>Type of unit</ion-label>\n        <select [(ngModel)]="newUnit.unitTemplateIndex">\n          <option *ngFor="let choice of dataProvider.templateChoices; let i=index"\n                  [ngValue]="i">\n            {{choice.displayName}}\n          </option>\n        </select>\n        <!-- For some reason the ion controls are completely messed up now with change detection, better to avoid and use plain Angular -->\n          <!--<ion-select [(ngModel)]="newUnit.unitTemplateIndex" name="unitTemplate">\n            <ion-option *ngFor="let choice of dataProvider.templateChoices; let i=index" value="{{i}}">\n              {{choice.displayName}}\n            </ion-option>\n          </ion-select>-->\n            <ion-label>Unit Name</ion-label>\n            <ion-input [(ngModel)]="newUnit.name" name="unitName"></ion-input>\n        <button ion-button color="secondary" (click)="saveNewUnit()">\n          Complete\n        </button>\n      </ion-col>\n    </ion-row>\n  </ion-grid>\n  <span\n    *ngIf="!dataProvider.templateChoices">\n    <ion-spinner></ion-spinner>\n  </span>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/admin/admin.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_2__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* AlertController */]])
], AdminPage);

//# sourceMappingURL=admin.js.map

/***/ }),

/***/ 414:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(415);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(433);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 433:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export MyErrorHandler */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_storage__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_camera__ = __webpack_require__(245);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ionic_native_file__ = __webpack_require__(248);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__ionic_native_transfer__ = __webpack_require__(249);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__ionic_native_image_resizer__ = __webpack_require__(250);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__app_component__ = __webpack_require__(483);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__pages_popoverflags_popoverflags__ = __webpack_require__(408);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__pages_inspectionlist_inspectionlist__ = __webpack_require__(133);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__pages_inspectioncreator_inspectioncreator__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__pages_popoverinsdate_popoverinsdate__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__pages_popovertrade_popovertrade__ = __webpack_require__(253);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__pages_propertyreporting_propertyreporting__ = __webpack_require__(153);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__pages_reportlist_reportlist__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__pages_reportcreator_reportcreator__ = __webpack_require__(152);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__pages_print_print__ = __webpack_require__(407);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__pages_admin_admin__ = __webpack_require__(413);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__pages_issuetypes_issuetypes__ = __webpack_require__(409);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__pages_login_login__ = __webpack_require__(251);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__pages_superdata_superdata__ = __webpack_require__(410);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__pages_superdatadrilldown_unittype_unittype__ = __webpack_require__(411);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__pages_superdatadrilldown_byunit_byunit__ = __webpack_require__(412);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__providers_auth_service__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28_ng2_charts_ng2_charts__ = __webpack_require__(610);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28_ng2_charts_ng2_charts___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_28_ng2_charts_ng2_charts__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__providers_dropbox_dropbox__ = __webpack_require__(135);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__pages_superdatadrilldown_unittable__ = __webpack_require__(611);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__ionic_pro__ = __webpack_require__(612);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__ionic_pro___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_31__ionic_pro__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




























//import { StatusBar } from '@ionic-native/status-bar';
//import { SplashScreen } from '@ionic-native/splash-screen';




var IonicPro = __WEBPACK_IMPORTED_MODULE_31__ionic_pro__["Pro"].init('133d9bcd', {
    appVersion: "1.0.5"
});
var MyErrorHandler = (function () {
    function MyErrorHandler(injector) {
        try {
            this.ionicErrorHandler = injector.get(__WEBPACK_IMPORTED_MODULE_4_ionic_angular__["d" /* IonicErrorHandler */]);
        }
        catch (e) {
            // Unable to get the IonicErrorHandler provider, ensure
            // IonicErrorHandler has been added to the providers list below
        }
    }
    MyErrorHandler.prototype.handleError = function (err) {
        IonicPro.monitoring.handleNewError(err);
        // Remove this if you want to disable Ionic's auto exception handling
        // in development mode.
        this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
    };
    return MyErrorHandler;
}());
MyErrorHandler = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_core__["Injector"]])
], MyErrorHandler);

var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_10__app_component__["a" /* MyApp */],
            __WEBPACK_IMPORTED_MODULE_11__pages_popoverflags_popoverflags__["a" /* PopoverFlagsPage */],
            __WEBPACK_IMPORTED_MODULE_12__pages_inspectionlist_inspectionlist__["a" /* InspectionListPage */],
            __WEBPACK_IMPORTED_MODULE_13__pages_inspectioncreator_inspectioncreator__["a" /* InspectionCreatorPage */],
            __WEBPACK_IMPORTED_MODULE_16__pages_propertyreporting_propertyreporting__["a" /* propertyReporting */],
            __WEBPACK_IMPORTED_MODULE_19__pages_print_print__["a" /* PrintPage */],
            __WEBPACK_IMPORTED_MODULE_17__pages_reportlist_reportlist__["a" /* ReportListPage */],
            __WEBPACK_IMPORTED_MODULE_18__pages_reportcreator_reportcreator__["a" /* ReportCreatorPage */],
            __WEBPACK_IMPORTED_MODULE_20__pages_admin_admin__["a" /* AdminPage */],
            __WEBPACK_IMPORTED_MODULE_21__pages_issuetypes_issuetypes__["a" /* Issuetypes */],
            __WEBPACK_IMPORTED_MODULE_14__pages_popoverinsdate_popoverinsdate__["a" /* PopoverinsdatePage */],
            __WEBPACK_IMPORTED_MODULE_15__pages_popovertrade_popovertrade__["a" /* PopoverTradePage */],
            __WEBPACK_IMPORTED_MODULE_22__pages_login_login__["a" /* LoginPage */],
            __WEBPACK_IMPORTED_MODULE_23__pages_superdata_superdata__["a" /* SuperDataPage */],
            __WEBPACK_IMPORTED_MODULE_24__pages_superdatadrilldown_unittype_unittype__["a" /* UnitTypePage */],
            __WEBPACK_IMPORTED_MODULE_25__pages_superdatadrilldown_byunit_byunit__["a" /* ByUnitPage */],
            __WEBPACK_IMPORTED_MODULE_30__pages_superdatadrilldown_unittable__["a" /* UnitTable */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_28_ng2_charts_ng2_charts__["ChartsModule"],
            __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["e" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_10__app_component__["a" /* MyApp */], {}, {
                links: []
            }),
            __WEBPACK_IMPORTED_MODULE_2__angular_http__["c" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_5__ionic_storage__["a" /* IonicStorageModule */].forRoot()
        ],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_4_ionic_angular__["c" /* IonicApp */]],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_10__app_component__["a" /* MyApp */],
            __WEBPACK_IMPORTED_MODULE_11__pages_popoverflags_popoverflags__["a" /* PopoverFlagsPage */],
            __WEBPACK_IMPORTED_MODULE_12__pages_inspectionlist_inspectionlist__["a" /* InspectionListPage */],
            __WEBPACK_IMPORTED_MODULE_13__pages_inspectioncreator_inspectioncreator__["a" /* InspectionCreatorPage */],
            __WEBPACK_IMPORTED_MODULE_16__pages_propertyreporting_propertyreporting__["a" /* propertyReporting */],
            __WEBPACK_IMPORTED_MODULE_19__pages_print_print__["a" /* PrintPage */],
            __WEBPACK_IMPORTED_MODULE_17__pages_reportlist_reportlist__["a" /* ReportListPage */],
            __WEBPACK_IMPORTED_MODULE_18__pages_reportcreator_reportcreator__["a" /* ReportCreatorPage */],
            __WEBPACK_IMPORTED_MODULE_20__pages_admin_admin__["a" /* AdminPage */],
            __WEBPACK_IMPORTED_MODULE_21__pages_issuetypes_issuetypes__["a" /* Issuetypes */],
            __WEBPACK_IMPORTED_MODULE_14__pages_popoverinsdate_popoverinsdate__["a" /* PopoverinsdatePage */],
            __WEBPACK_IMPORTED_MODULE_15__pages_popovertrade_popovertrade__["a" /* PopoverTradePage */],
            __WEBPACK_IMPORTED_MODULE_22__pages_login_login__["a" /* LoginPage */],
            __WEBPACK_IMPORTED_MODULE_23__pages_superdata_superdata__["a" /* SuperDataPage */],
            __WEBPACK_IMPORTED_MODULE_24__pages_superdatadrilldown_unittype_unittype__["a" /* UnitTypePage */],
            __WEBPACK_IMPORTED_MODULE_25__pages_superdatadrilldown_byunit_byunit__["a" /* ByUnitPage */]
        ],
        providers: [
            __WEBPACK_IMPORTED_MODULE_26__providers_data__["a" /* Data */],
            __WEBPACK_IMPORTED_MODULE_27__providers_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_6__ionic_native_camera__["a" /* Camera */],
            __WEBPACK_IMPORTED_MODULE_7__ionic_native_file__["a" /* File */],
            __WEBPACK_IMPORTED_MODULE_8__ionic_native_transfer__["a" /* Transfer */],
            __WEBPACK_IMPORTED_MODULE_9__ionic_native_image_resizer__["a" /* ImageResizer */],
            //StatusBar,
            //SplashScreen,
            __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["d" /* IonicErrorHandler */],
            __WEBPACK_IMPORTED_MODULE_3__angular_common__["c" /* DatePipe */],
            { provide: __WEBPACK_IMPORTED_MODULE_1__angular_core__["ErrorHandler"], useClass: MyErrorHandler }, __WEBPACK_IMPORTED_MODULE_29__providers_dropbox_dropbox__["a" /* DropboxProvider */]
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 483:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__pages_login_login__ = __webpack_require__(251);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__pages_admin_admin__ = __webpack_require__(413);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_inspectionlist_inspectionlist__ = __webpack_require__(133);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_propertyreporting_propertyreporting__ = __webpack_require__(153);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_auth_service__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


//import { StatusBar } from '@ionic-native/status-bar';
//import { SplashScreen } from '@ionic-native/splash-screen';






//import { AdminPage } from '../pages/admin/admin';
// Uncomment this for deployment

Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["enableProdMode"])();
var MyApp = (function () {
    function MyApp(platform, auth, dataProvider /*, public statusBar: StatusBar, public splashScreen: SplashScreen*/) {
        this.platform = platform;
        this.auth = auth;
        this.dataProvider = dataProvider; /*, public statusBar: StatusBar, public splashScreen: SplashScreen*/
        this.rootPage = __WEBPACK_IMPORTED_MODULE_2__pages_login_login__["a" /* LoginPage */];
        this.initializeApp();
        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Inspections', component: __WEBPACK_IMPORTED_MODULE_4__pages_inspectionlist_inspectionlist__["a" /* InspectionListPage */] },
            { title: 'Reporting', component: __WEBPACK_IMPORTED_MODULE_5__pages_propertyreporting_propertyreporting__["a" /* propertyReporting */] },
        ];
    }
    MyApp.prototype.goToAdminPage = function () {
        this.openPage({ title: 'Admin', component: __WEBPACK_IMPORTED_MODULE_3__pages_admin_admin__["a" /* AdminPage */] });
    };
    MyApp.prototype.goToHomePage = function () {
        this.openPage({ title: 'Inspections', component: __WEBPACK_IMPORTED_MODULE_4__pages_inspectionlist_inspectionlist__["a" /* InspectionListPage */] });
    };
    MyApp.prototype.allowUser = function () {
        return (this.auth.currentUser && (this.auth.currentUser.username.indexOf('Demo') == -1) && (this.auth.currentUser.username.indexOf('demo') == -1));
    };
    MyApp.prototype.initializeApp = function () {
        /*this.platform.ready().then(() => {
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
          this.statusBar.styleDefault();
          //this.splashScreen.hide();
        });*/
    };
    MyApp.prototype.openPage = function (page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    };
    MyApp.prototype.logout = function () {
        this.dataProvider.resetAll();
        this.auth.logout();
        this.nav.setRoot(__WEBPACK_IMPORTED_MODULE_2__pages_login_login__["a" /* LoginPage */]);
    };
    return MyApp;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* Nav */]),
    __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* Nav */])
], MyApp.prototype, "nav", void 0);
MyApp = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/app/app.html"*/'<ion-split-pane class="obey-me print-hide" >\n<ion-menu [content]="content" class="top-nav-fix"  persistent="true">\n  <ion-content>\n    <button *ngIf="auth.currentUser != null" menuClose ion-item (click)="goToHomePage()" class="home-logo"> <img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo">\n            </button>\n    <ion-list *ngIf="auth.currentUser != null">\n      <button menuClose ion-item *ngFor="let p of pages" (click)="openPage(p)">\n        {{p.title}}\n      </button>\n      <!-- allUser right now will make sure this is hidden for Demo accounts -->\n      <button *ngIf="allowUser()"\n              menuClose ion-item (click)="goToAdminPage()">\n        Admin\n      </button>\n      <button menuClose ion-item (click)="logout()" name="logout">\n        Logout\n      </button>\n      <button menuClose ion-button (click)="dataProvider.manualDBSync()" name="sync" [disabled]="dataProvider.isSyncing">\n        <span *ngIf="dataProvider.isSyncing">Syncing</span>\n        <span *ngIf="!dataProvider.isSyncing">Cloud Sync</span>\n      </button>\n    </ion-list>\n    <!--<ion-list>\n      <button menuClose ion-item (click)="logout()" name="sync">\n        Cloud Sync\n      </button>\n    </ion-list>-->\n  </ion-content>\n\n</ion-menu>\n\n<!-- Disable swipe-to-go-back because it\'s poor UX to combine STGB with side menus -->\n<ion-nav main [root]="rootPage" #content swipeBackEnabled="false" class="main-content"></ion-nav>\n</ion-split-pane>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/app/app.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* Platform */], __WEBPACK_IMPORTED_MODULE_6__providers_auth_service__["a" /* AuthService */], __WEBPACK_IMPORTED_MODULE_7__providers_data__["a" /* Data */] /*, public statusBar: StatusBar, public splashScreen: SplashScreen*/])
], MyApp);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 57:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ReportListPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__inspectioncreator_inspectioncreator__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__reportcreator_reportcreator__ = __webpack_require__(152);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__propertyreporting_propertyreporting__ = __webpack_require__(153);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__popoverflags_popoverflags__ = __webpack_require__(408);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__issuetypes_issuetypes__ = __webpack_require__(409);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__providers_auth_service__ = __webpack_require__(28);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};










var ReportListPage = (function () {
    function ReportListPage(navCtrl, popoverCtrl, navParams, dataProvider, cdRef, auth, toast) {
        this.navCtrl = navCtrl;
        this.popoverCtrl = popoverCtrl;
        this.navParams = navParams;
        this.dataProvider = dataProvider;
        this.cdRef = cdRef;
        this.auth = auth;
        this.toast = toast;
        // In case the page is opened without a unit provided to the router
        this.unit = {
            _id: '',
            name: ''
        };
        this.ownerReport = null;
        this.topDoughnutChart = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "80",
                aspectRatio: 1
            }
        };
        this.roomDoughnutChart = {
            colors: [{
                    backgroundColor: [
                        'rgba(254, 0, 0, 1)',
                        'rgba(221, 221, 221, 1)'
                    ],
                    borderColor: [
                        'rgba(254, 0, 0, 1)',
                        'rgba(221, 221, 221, 1)'
                    ]
                }],
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "80",
                aspectRatio: 1
            }
        };
        this.shownItemDetails = '';
        this.allReportsByUnit = null;
        this.numOfPotentialProj = null;
    }
    ReportListPage.prototype.ionViewDidLoad = function () {
        var _this = this;
        var checkOwnerReport = this.navParams.get('ownerReport');
        if (typeof (checkOwnerReport) !== 'undefined') {
            this.ownerReport = checkOwnerReport;
        }
        var noInspectionLoad = this.navParams.get('noInspectionLoad');
        var unit = this.navParams.get('unit');
        if ((typeof (unit) !== 'undefined') && (typeof (unit._id) !== 'undefined')) {
            this.unit = unit;
            if ((typeof (noInspectionLoad) === 'undefined') || (noInspectionLoad === false)) {
                this.dataProvider.getInspections(unit).then(function (inspections) {
                    if ((inspections.length) && (inspections.length > 0)) {
                        // The template code should block rendering by waiting for data inside the appropriate structures
                        var tmplProm = _this.dataProvider.getTemplateById(inspections[0].templateID);
                        var visProm = _this.dataProvider.getVisitData(inspections[0]);
                        Promise.all([tmplProm, visProm]).then(function () {
                            _this.getAndSetFlags();
                        });
                    }
                });
            }
        }
        this.allReportsByUnit = null;
        this.dataProvider.getAllReportsByUnit()
            .then(function (resultReport) {
            _this.allReportsByUnit = resultReport;
            if (!_this.allReportsByUnit[unit._id] || !_this.allReportsByUnit[unit._id].projObjDict) {
                _this.numOfPotentialProj = 0;
            }
            else {
                _this.numOfPotentialProj = Object.keys(_this.allReportsByUnit[unit._id].projObjDict).length;
            }
        });
    };
    ReportListPage.prototype.getAndSetFlags = function () {
        var categoriesArray = Object.keys(this.dataProvider.inspectionTemplate.trades);
        this.alphabeticFlaggedItemCategories = [];
        this.sortedFlaggedItemCategories = [];
        var categoryIndices = {};
        for (var index = 0; index < categoriesArray.length; index++) {
            var category = categoriesArray[index];
            this.alphabeticFlaggedItemCategories.push({ category: category, count: 0 });
            categoryIndices[category] = index;
        }
        if (this.dataProvider.issueStructure._flagsList.length > 0) {
            for (var _i = 0, _a = this.dataProvider.issueStructure._flagsList; _i < _a.length; _i++) {
                var flag = _a[_i];
                var category = flag.split('|')[1];
                this.alphabeticFlaggedItemCategories[categoryIndices[category]].count++;
            }
            Object.assign(this.sortedFlaggedItemCategories, this.alphabeticFlaggedItemCategories);
            this.sortedFlaggedItemCategories.sort(function (a, b) { return b.count - a.count; });
            // console.log(this.sortedFlaggedItemCategories);
        }
    };
    ReportListPage.prototype.showReportPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__propertyreporting_propertyreporting__["a" /* propertyReporting */], {}, { animate: true, direction: 'backward' });
    };
    ReportListPage.prototype.showInspectionCreatorPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__inspectioncreator_inspectioncreator__["a" /* InspectionCreatorPage */], { unit: this.unit }, { animate: true, direction: 'forward' });
    };
    ReportListPage.prototype.showReportCreatorPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_3__reportcreator_reportcreator__["a" /* ReportCreatorPage */], { unit: this.unit, ownerReport: this.ownerReport }, { animate: true, direction: 'forward' });
    };
    ReportListPage.prototype.openPopover = function (myEvent, roomID, itemID, itemName) {
        console.log('openPopover()', roomID, itemID, itemName);
        var popover = this.popoverCtrl.create(__WEBPACK_IMPORTED_MODULE_5__popoverflags_popoverflags__["a" /* PopoverFlagsPage */], {
            invokeSavePopup: this.invokeSavePopup,
            roomID: roomID,
            itemID: itemID,
            itemName: itemName
        });
        popover.present({
            ev: myEvent
        });
    };
    ReportListPage.prototype.flagIsChecked = function (roomID, itemObjID) {
        return !!this.dataProvider.inspectionData.data[roomID].data[itemObjID]['reportFlag'];
    };
    ReportListPage.prototype.toggleItemDetails = function (itemID) {
        if (this.isItemDetailShown(itemID)) {
            this.shownItemDetails = '';
        }
        else {
            this.shownItemDetails = itemID;
        }
        this.cdRef.detectChanges();
    };
    ;
    ReportListPage.prototype.isItemDetailShown = function (itemID) {
        return this.shownItemDetails === itemID;
    };
    ;
    ReportListPage.prototype.showIssuesPage = function () {
        // Comment out until Issues page is connected to real data
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_6__issuetypes_issuetypes__["a" /* Issuetypes */], {
            unit: this.unit,
            sortedFlaggedItemCategories: this.sortedFlaggedItemCategories
        });
    };
    ReportListPage.prototype.invokeSavePopup = function (message) {
        var toast = this.toast.create({
            message: message,
            duration: 3000,
            position: 'top',
        });
        toast.present();
    };
    ReportListPage.prototype.toggleItemFlag = function (roomID, itemID, itemName, addFlag) {
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        if (addFlag) {
            console.log('added flag to structures');
            this.dataProvider.issueStructure._flagsList.push(itemID);
            this.dataProvider.roomStructure[roomID].data.flagsList.push(itemName);
        }
        else {
            console.log('removing flag from structures');
            this.dataProvider.issueStructure._flagsList.splice(this.dataProvider.issueStructure._flagsList.indexOf(itemID), 1);
            this.dataProvider.roomStructure[roomID].data.flagsList.push(this.dataProvider.roomStructure[roomID].data.flagsList.indexOf(itemName), 1);
        }
        this.dataProvider.inspectionData.data[roomID].data[itemID].reportFlag = !this.dataProvider.inspectionData.data[roomID].data[itemID].reportFlag;
        this.dataProvider.currentUnsavedItemData.reportFlag = this.dataProvider.inspectionData.data[roomID].data[itemID].reportFlag;
        this.dataProvider.saveCurrentUnsavedItemData(this.auth.currentUser.username, [roomID], itemID);
        this.invokeSavePopup(itemName + ' was saved in ' + roomID);
        this.getAndSetFlags();
    };
    ReportListPage.prototype.getProjectTotalsFromUnit = function (unit) {
        var report = this.allReportsByUnit[unit._id];
        if (!report || !report.projObjDict) {
            return null;
        }
        else {
            var projectsHighTotal = 0;
            var projKeys = Object.keys(report.projObjDict);
            for (var index = 0, len = projKeys.length; index < len; index++) {
                var thisProj = report.projObjDict[projKeys[index]];
                if (!thisProj.removeMe && thisProj.estimate) {
                    projectsHighTotal += thisProj.estimate.upper;
                }
            }
            return projectsHighTotal;
        }
    };
    ReportListPage.prototype.getHostCategory = function (rating) {
        if (rating >= 8) {
            return 'Luxury';
        }
        else if (rating >= 6) {
            return 'Deluxe';
        }
        else if (rating >= 4) {
            return 'Standard';
        }
        else if (rating <= 3) {
            return 'Budget';
        }
    };
    return ReportListPage;
}());
ReportListPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-reportlist',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/reportlist/reportlist.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title><img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile"></ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main ">\n  <ion-grid *ngIf="(dataProvider.inspectionTemplate.roomOrder)&&(dataProvider.inspectionTemplate.data)&&(dataProvider.hospitalityStructure.chartColors)">\n    <ion-row id="reportingPage" class="page-nav  ">\n      <ion-col col-6>\n\n        <a id="changeUnitLink" (click)="showReportPage()" class="clickable-element">\n          <p class="negative-margin">\n            <ion-icon name="arrow-back"></ion-icon> Change unit</p>\n          <h2 class="page-header">{{unit.name}}</h2>\n\n          <p class="negative-margin inspector">\n            Unit Template\n          </p>\n        </a>\n      </ion-col>\n      <ion-col col-md-6 class="cta">\n        <button ion-button class="light-purple" (click)="showInspectionCreatorPage()">\n          <div>\n        <img src="assets/icon/inspection.svg" alt="Magnifying glass" > <p>Start<br /> Inspection<p></div>\n        </button>\n        <button ion-button color="secondary" (click)="showReportCreatorPage()">\n          <div>\n          <img src="assets/icon/report-writing.svg" alt="Report Writing" > <p *ngIf="!ownerReport">Create<br /> Report</p>\n          <span *ngIf="ownerReport"><p>Continue<br /> Report</p></span>\n        </div>\n        </button>\n      </ion-col>\n\n    </ion-row>\n    <ion-row class="donut-header">\n      <ion-col col-6 col-md-3 class="donut-side">\n        <ion-row *ngIf="dataProvider.hospitalityStructure.count > 0">\n          <canvas baseChart [data]="[(dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count),(10- (dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count))]" [chartType]="\'doughnut\'" [colors]="dataProvider.hospitalityStructure.chartColors"\n            [options]="topDoughnutChart.options"></canvas>\n          <div class="inside-donut">\n            <h2>\n                {{dataProvider.hospitalityStructure.intPortion}}<span class="decimals">{{dataProvider.hospitalityStructure.remainderPortion}}</span>\n                <span class="label">Unit</span>\n              </h2>\n          </div>\n          <h4>{{getHostCategory(dataProvider.hospitalityStructure.intPortion)}}</h4>\n          <p class="word-cloud">\n            <span *ngFor="let tagName of dataProvider.issueStructure._tagHighestArray; let i=index" [style.font-size]="((dataProvider.issueStructure._tagHighestArray.length - i)/2 + 1)+\'em\'">\n                  {{tagName}}\n                  <br/>\n                </span>\n          </p>\n        </ion-row>\n      </ion-col>\n      <ion-col col-12 col-md-9>\n        <ion-row>\n          <ion-col col-12 col-md-11 offset-1>\n            <ion-row>\n              <ion-col class="align-right" col-6 col-md-5>\n                <h3>{{ dataProvider.issueStructure._itemsInspectedCount }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-md-5>\n                <p class="number-label">Items<br />Inspected</p>\n              </ion-col>\n            </ion-row>\n            <ion-row class="reports-inspected">\n              <ng-container *ngFor="let issueID of dataProvider.issueStructure[\'_keys\']">\n                <ion-col class="inspection-items" col-2>\n\n\n\n                  <h3>{{ dataProvider.issueStructure[issueID].count }}</h3>\n                  <p>{{issueID}}<br /><span> {{ dataProvider.issueStructure[issueID].timelineText }}</span></p>\n\n\n                </ion-col>\n              </ng-container>\n            </ion-row>\n          </ion-col>\n        </ion-row>\n        <ion-row>\n          <ion-col col-6 col-md-4>\n            <ion-row>\n              <ion-col col-6 class="align-right">\n                <h3>{{ dataProvider.issueStructure._total }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">Issues<br />Found</p>\n                <button id="issueReportBtn" ion-button (click)="showIssuesPage();" class="clickable-element item-report light-purple"><div>\n                    <img src="assets/icon/report-writing.svg" alt="Report Writing" >\n                  <p>Issue<br /> Report</p>\n                </div>\n                </button>\n              </ion-col>\n            </ion-row>\n\n\n          </ion-col>\n          <ion-col col-6 col-md-4>\n            <ion-row>\n              <ion-col col-6 class="align-right">\n                <h3>{{ dataProvider.issueStructure._flagsList.length }}</h3>\n\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">Flagged<br />Items</p>\n              </ion-col>\n\n            </ion-row>\n            <ion-row>\n              <ion-col class="align-right" col-6>\n                <ul>\n                  <ng-container *ngFor="let category of sortedFlaggedItemCategories; let i = index;">\n                    <li *ngIf="category.count !== 0" [ngClass]="{ \'highest\': i === 0 }">{{ category.count }}</li>\n                  </ng-container>\n                </ul>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <ul>\n                  <ng-container *ngFor="let category of sortedFlaggedItemCategories; let i = index;">\n                    <li *ngIf="category.count !== 0" [ngClass]="{ \'highest\': i === 0 }">{{ category.category }}</li>\n                  </ng-container>\n                </ul>\n              </ion-col>\n            </ion-row>\n\n          </ion-col>\n          <ion-col col-6 col-md-4>\n            <ion-row *ngIf="numOfPotentialProj">\n              <ion-col class="align-right" col-6>\n                <h3>{{numOfPotentialProj}}</h3>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">Projects\n                  <br />Worth Starting</p>\n              </ion-col>\n            </ion-row>\n\n          </ion-col>\n        </ion-row>\n        <ion-row class="nopadding">\n          <ion-col col-6 col-md-5>\n            <ion-row *ngIf="allReportsByUnit">\n              <ion-col class="align-right" col-6>\n                <h3 class="potential-revenue">{{getProjectTotalsFromUnit(unit) | currency:\'USD\':true: \'.0\'}}</h3>\n              </ion-col>\n              <ion-col class="align-left" col-6>\n                <p class="number-label">Potential\n                  <br />Revenue</p>\n              </ion-col>\n            </ion-row>\n\n          </ion-col>\n          <ion-col col-6 col-md-4>\n\n\n\n\n\n\n          </ion-col>\n\n        </ion-row>\n      </ion-col>\n    </ion-row>\n\n    <ng-container *ngFor="let roomID of dataProvider.inspectionTemplate.roomOrder">\n      <ion-list class="reporting-page" *ngIf="dataProvider.roomStructure[roomID] && dataProvider.roomStructure[roomID].data && dataProvider.roomStructure[roomID].data.itemList && dataProvider.roomStructure[roomID].data.completedItemCount">\n        <ion-row>\n          <ion-col>\n            <ion-row>\n              <h2 class="room-header">\n                <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[roomID]">\n                  {{dataProvider.inspectionTemplate.roomAliases[roomID]}}\n                </span>\n                <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[roomID]">\n                  {{roomID}}\n                </span>\n              </h2>\n            </ion-row>\n            <ion-row>\n              <ion-col col-12 col-md-2 class="donut-side reporting">\n                <ion-row *ngIf="dataProvider.roomStructure[roomID].data.hospitalityCount > 0">\n                  <ion-col col-6 col-md-12>\n                    <canvas baseChart [data]="[(dataProvider.roomStructure[roomID].data.hospitalitySum / dataProvider.roomStructure[roomID].data.hospitalityCount),(10- (dataProvider.roomStructure[roomID].data.hospitalitySum / dataProvider.roomStructure[roomID].data.hospitalityCount))]"\n                      [chartType]="\'doughnut\'" [colors]="dataProvider.roomStructure[roomID].data.chartColors" [options]="roomDoughnutChart.options"></canvas>\n                    <div class="inside-donut">\n                      <h2>\n                        {{ dataProvider.roomStructure[roomID].data.hospitalityInt }}<span class="decimals">{{ dataProvider.roomStructure[roomID].data.hospitalityRemainder }}</span>\n                        <span class="label"></span>\n                      </h2>\n                    </div>\n\n                  </ion-col>\n                  <ion-col col-6 col-md-12>\n                    <ion-row>\n                      <ion-col class="align-right">\n\n                          <ng-container *ngFor="let timelineID of dataProvider.issueStructure[\'_keys\']">\n                            <ng-container *ngIf="dataProvider.roomStructure[roomID].data.issueTypeCounts[timelineID]">\n                              <h3>{{dataProvider.roomStructure[roomID].data.issueTypeCounts[timelineID]}}<span class="label">{{timelineID}}</span> </h3>\n                            </ng-container>\n                          </ng-container>\n\n                      </ion-col>\n\n                    </ion-row>\n\n                    <!--  <h3>{{dataProvider.roomStructure[roomID].data.commentCount }} <span class="label">Comments</span></h3>-->\n                    <div class="tag-cloud">\n                      <p class="word-cloud">\n                        <span *ngFor="let tagName of dataProvider.roomStructure[roomID].data.tagHighestArray; let i=index" [style.font-size]="((dataProvider.roomStructure[roomID].data.tagHighestArray.length - i)/2 + 1)+\'em\'">\n                        {{tagName}}\n                        <br/>\n                      </span>\n                      </p>\n                    </div>\n                  </ion-col>\n                </ion-row>\n\n              </ion-col>\n              <ion-col col-12 col-md-9 offset-md-1 class="table">\n                <ion-row class="table-header">\n                  <ion-col col-5 col-md-3>\n                    <div class="list-header" item-left>\n                      Item\n                    </div>\n                  </ion-col>\n                  <ion-col col-1>\n                    <div class="list-header" item-left>\n                      Rating\n                    </div>\n                  </ion-col>\n                  <ion-col col-6 col-md-4>\n                    <div class="list-header" item-left>\n                      Comments\n                    </div>\n                  </ion-col>\n                  <ion-col col-6 col-md-2>\n                  </ion-col>\n                  <ion-col col-6 col-md-2>\n                  </ion-col>\n                </ion-row>\n                <ng-container *ngFor="let itemObj of dataProvider.roomStructure[roomID].data.itemList">\n                  <ion-row *ngIf="!itemObj.item.naChoice" class="row">\n                    <!--TODO cell additional styling needed?-->\n                    <ion-col col-5 col-md-3>\n                      <!--{{itemObj._id}}-->\n                      <ng-container *ngIf="dataProvider.inspectionTemplate.data[roomID]">\n                        <p class="table-first-item" *ngIf="dataProvider.inspectionTemplate.data[roomID].data[itemObj._id]">\n                          {{dataProvider.inspectionTemplate.data[roomID].data[itemObj._id].Item}}\n                        </p>\n                      </ng-container>\n                    </ion-col>\n                    <ion-col col-1>\n                      <p>{{itemObj.item.hospitalityRating}}</p>\n                    </ion-col>\n                    <ion-col col-6 col-md-4>\n                      <ng-container *ngIf="!itemObj.item.mergedComments">\n                        <p *ngFor="let commentKey of itemObj.commentKeys">\n                          {{itemObj.item.comments[commentKey].text}}\n                        </p>\n                      </ng-container>\n                      <ng-container *ngIf="itemObj.item.mergedComments">\n                        <p>{{itemObj.item.mergedComments}}</p>\n                      </ng-container>\n                    </ion-col>\n                    <ion-col col-6 col-md-2 class="button lightest-purple">\n                      <button class="light-purple" ion-button (click)="toggleItemFlag(roomID, itemObj._id, dataProvider.inspectionTemplate.data[roomID].data[itemObj._id].Item, !dataProvider.inspectionData.data[roomID].data[itemObj._id][\'reportFlag\']); $event.stopPropagation()">\n                        <ion-icon name="flag" [ngStyle]="{\'color\':dataProvider.inspectionData.data[roomID].data[itemObj._id][\'reportFlag\'] ? \'red\' : \'gray\' }" >\n                      </ion-icon>\n                    </button>\n                      <!-- <button\n                      class="popover-menu"\n                      (click)="openPopover($event, roomID, itemObj._id, dataProvider.inspectionTemplate.data[roomID].data[itemObj._id].Item)">\n                      <ion-icon name="flag" [ngStyle]="{\'color\':flagIsChecked(roomID, itemObj._id) ? \'red\' : \'gray\' }"></ion-icon>\n                    </button> -->\n                    </ion-col>\n                    <!--<div class="cell col1">\n                      <ng-container *ngIf="itemObj.item.inspectionWorkTrackingConditions">\n                        <ion-icon name="ios-alert" *ngIf="dataProvider.issueStructure[\'_problemKeyDict\'][itemObj.item.inspectionWorkTrackingConditions.selection]">\n                        </ion-icon>\n                      </ng-container>\n                    </div>\n\n\n                    <div class="cell col4">\n                      <ng-container *ngIf="itemObj.item.inspectionWorkTrackingConditions">\n                        {{itemObj.item.inspectionWorkTrackingConditions.selection}}\n                      </ng-container>\n                    </div>-->\n\n                    <ion-col col-6 col-md-2 class=" button light-purple">\n                      <button class="button button button-default" *ngIf="itemObj.item.markSectionComplete && !itemObj.item.naChoice" (click)="toggleItemDetails(itemObj._id)" [ngClass]="{active: isItemDetailShown(itemObj._id)}">\n                      <ion-icon color="success" *ngIf="(itemObj.typeConditionKeys.length > 0) || (itemObj.imageKeys.length > 0)" item-right [name]="isItemDetailShown(itemObj._id) ? \'arrow-dropdown\' : \'arrow-dropright\'"></ion-icon>\n                    </button>\n                    </ion-col>\n                    <ion-row class="details" *ngIf="isItemDetailShown(itemObj._id)">\n\n                      <!-- Commenting out this full-cell style for now, don\'t think we will use it -->\n                      <!--<div class="full-cell flex">\n                            <p><span class="label">Type</span>Screen, Glass</p>\n                            <p><span class="label">Finish/Color</span>Black & White metal</p>\n                            <p><span class="label">Integrity</span>It has none</p>\n                          </div>-->\n                      <ng-container *ngFor="let conditionObj of itemObj.typeConditionKeys">\n                        <ion-col col-6 col-md-4 *ngIf="conditionObj.optionKeys && conditionObj.optionKeys.length">\n                          <p><strong>{{conditionObj._id}}</strong></p>\n                          <ng-container *ngFor="let optionKey of conditionObj.optionKeys">\n                            <p *ngIf="itemObj.item.typesConditions[conditionObj._id][optionKey].checkboxValue || itemObj.item.typesConditions[conditionObj._id][optionKey].textValue">\n                              <span class="label">{{ dataProvider.getOptionTemplateFromID(conditionObj._id, optionKey)?.subLabel }}</span> {{ dataProvider.getOptionTemplateFromID(conditionObj._id, optionKey)?.optionName }}\n                              <span *ngIf="itemObj.item.typesConditions[conditionObj._id][optionKey].textValue">\n                                  : {{ itemObj.item.typesConditions[conditionObj._id][optionKey].textValue }}\n                                </span>\n                            </p>\n                          </ng-container>\n                        </ion-col>\n                      </ng-container>\n\n                      <ng-container *ngIf="itemObj.imageKeys.length > 0">\n                        <ng-container *ngFor="let imageID of itemObj.imageKeys">\n                          <ion-col col-6 col-md-3 *ngIf="itemObj.item.images[imageID] && itemObj.item.images[imageID].thumb400">\n                            <p>\n                              <img width="100%" height="auto" [src]="itemObj.item.images[imageID].thumb400" />\n                            </p>\n                          </ion-col>\n                          <ion-col col-6 col-md-3 *ngIf="!(itemObj.item.images[imageID] && itemObj.item.images[imageID].thumb400) && itemObj.item.images[imageID].localOrigURI">\n                            <p>\n                              <img width="100%" height="auto" [src]="dataProvider.fileURIasSrc(itemObj.item.images[imageID].localOrigURI)" />\n                            </p>\n                          </ion-col>\n                        </ng-container>\n                      </ng-container>\n                    </ion-row>\n                  </ion-row>\n                </ng-container>\n              </ion-col>\n            </ion-row>\n          </ion-col>\n        </ion-row>\n      </ion-list>\n    </ng-container>\n\n  </ion-grid>\n  <span *ngIf="!((dataProvider.inspectionTemplate.roomOrder)&&(dataProvider.inspectionTemplate.data)&&(dataProvider.hospitalityStructure.chartColors))" class="content-max-width header-padding">\n      <ion-spinner></ion-spinner>\n    </span>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/reportlist/reportlist.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* PopoverController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */], __WEBPACK_IMPORTED_MODULE_7__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_0__angular_core__["ChangeDetectorRef"], __WEBPACK_IMPORTED_MODULE_8__providers_auth_service__["a" /* AuthService */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["m" /* ToastController */]])
], ReportListPage);

//# sourceMappingURL=reportlist.js.map

/***/ }),

/***/ 592:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": 292,
	"./af.js": 292,
	"./ar": 293,
	"./ar-dz": 294,
	"./ar-dz.js": 294,
	"./ar-kw": 295,
	"./ar-kw.js": 295,
	"./ar-ly": 296,
	"./ar-ly.js": 296,
	"./ar-ma": 297,
	"./ar-ma.js": 297,
	"./ar-sa": 298,
	"./ar-sa.js": 298,
	"./ar-tn": 299,
	"./ar-tn.js": 299,
	"./ar.js": 293,
	"./az": 300,
	"./az.js": 300,
	"./be": 301,
	"./be.js": 301,
	"./bg": 302,
	"./bg.js": 302,
	"./bn": 303,
	"./bn.js": 303,
	"./bo": 304,
	"./bo.js": 304,
	"./br": 305,
	"./br.js": 305,
	"./bs": 306,
	"./bs.js": 306,
	"./ca": 307,
	"./ca.js": 307,
	"./cs": 308,
	"./cs.js": 308,
	"./cv": 309,
	"./cv.js": 309,
	"./cy": 310,
	"./cy.js": 310,
	"./da": 311,
	"./da.js": 311,
	"./de": 312,
	"./de-at": 313,
	"./de-at.js": 313,
	"./de-ch": 314,
	"./de-ch.js": 314,
	"./de.js": 312,
	"./dv": 315,
	"./dv.js": 315,
	"./el": 316,
	"./el.js": 316,
	"./en-au": 317,
	"./en-au.js": 317,
	"./en-ca": 318,
	"./en-ca.js": 318,
	"./en-gb": 319,
	"./en-gb.js": 319,
	"./en-ie": 320,
	"./en-ie.js": 320,
	"./en-nz": 321,
	"./en-nz.js": 321,
	"./eo": 322,
	"./eo.js": 322,
	"./es": 323,
	"./es-do": 324,
	"./es-do.js": 324,
	"./es.js": 323,
	"./et": 325,
	"./et.js": 325,
	"./eu": 326,
	"./eu.js": 326,
	"./fa": 327,
	"./fa.js": 327,
	"./fi": 328,
	"./fi.js": 328,
	"./fo": 329,
	"./fo.js": 329,
	"./fr": 330,
	"./fr-ca": 331,
	"./fr-ca.js": 331,
	"./fr-ch": 332,
	"./fr-ch.js": 332,
	"./fr.js": 330,
	"./fy": 333,
	"./fy.js": 333,
	"./gd": 334,
	"./gd.js": 334,
	"./gl": 335,
	"./gl.js": 335,
	"./gom-latn": 336,
	"./gom-latn.js": 336,
	"./he": 337,
	"./he.js": 337,
	"./hi": 338,
	"./hi.js": 338,
	"./hr": 339,
	"./hr.js": 339,
	"./hu": 340,
	"./hu.js": 340,
	"./hy-am": 341,
	"./hy-am.js": 341,
	"./id": 342,
	"./id.js": 342,
	"./is": 343,
	"./is.js": 343,
	"./it": 344,
	"./it.js": 344,
	"./ja": 345,
	"./ja.js": 345,
	"./jv": 346,
	"./jv.js": 346,
	"./ka": 347,
	"./ka.js": 347,
	"./kk": 348,
	"./kk.js": 348,
	"./km": 349,
	"./km.js": 349,
	"./kn": 350,
	"./kn.js": 350,
	"./ko": 351,
	"./ko.js": 351,
	"./ky": 352,
	"./ky.js": 352,
	"./lb": 353,
	"./lb.js": 353,
	"./lo": 354,
	"./lo.js": 354,
	"./lt": 355,
	"./lt.js": 355,
	"./lv": 356,
	"./lv.js": 356,
	"./me": 357,
	"./me.js": 357,
	"./mi": 358,
	"./mi.js": 358,
	"./mk": 359,
	"./mk.js": 359,
	"./ml": 360,
	"./ml.js": 360,
	"./mr": 361,
	"./mr.js": 361,
	"./ms": 362,
	"./ms-my": 363,
	"./ms-my.js": 363,
	"./ms.js": 362,
	"./my": 364,
	"./my.js": 364,
	"./nb": 365,
	"./nb.js": 365,
	"./ne": 366,
	"./ne.js": 366,
	"./nl": 367,
	"./nl-be": 368,
	"./nl-be.js": 368,
	"./nl.js": 367,
	"./nn": 369,
	"./nn.js": 369,
	"./pa-in": 370,
	"./pa-in.js": 370,
	"./pl": 371,
	"./pl.js": 371,
	"./pt": 372,
	"./pt-br": 373,
	"./pt-br.js": 373,
	"./pt.js": 372,
	"./ro": 374,
	"./ro.js": 374,
	"./ru": 375,
	"./ru.js": 375,
	"./sd": 376,
	"./sd.js": 376,
	"./se": 377,
	"./se.js": 377,
	"./si": 378,
	"./si.js": 378,
	"./sk": 379,
	"./sk.js": 379,
	"./sl": 380,
	"./sl.js": 380,
	"./sq": 381,
	"./sq.js": 381,
	"./sr": 382,
	"./sr-cyrl": 383,
	"./sr-cyrl.js": 383,
	"./sr.js": 382,
	"./ss": 384,
	"./ss.js": 384,
	"./sv": 385,
	"./sv.js": 385,
	"./sw": 386,
	"./sw.js": 386,
	"./ta": 387,
	"./ta.js": 387,
	"./te": 388,
	"./te.js": 388,
	"./tet": 389,
	"./tet.js": 389,
	"./th": 390,
	"./th.js": 390,
	"./tl-ph": 391,
	"./tl-ph.js": 391,
	"./tlh": 392,
	"./tlh.js": 392,
	"./tr": 393,
	"./tr.js": 393,
	"./tzl": 394,
	"./tzl.js": 394,
	"./tzm": 395,
	"./tzm-latn": 396,
	"./tzm-latn.js": 396,
	"./tzm.js": 395,
	"./uk": 397,
	"./uk.js": 397,
	"./ur": 398,
	"./ur.js": 398,
	"./uz": 399,
	"./uz-latn": 400,
	"./uz-latn.js": 400,
	"./uz.js": 399,
	"./vi": 401,
	"./vi.js": 401,
	"./x-pseudo": 402,
	"./x-pseudo.js": 402,
	"./yo": 403,
	"./yo.js": 403,
	"./zh-cn": 404,
	"./zh-cn.js": 404,
	"./zh-hk": 405,
	"./zh-hk.js": 405,
	"./zh-tw": 406,
	"./zh-tw.js": 406
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 592;

/***/ }),

/***/ 611:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UnitTable; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var UnitTable = (function () {
    function UnitTable(dataProvider) {
        this.dataProvider = dataProvider;
    }
    UnitTable.prototype.ionViewDidLoad = function () {
    };
    return UnitTable;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
    __metadata("design:type", Object)
], UnitTable.prototype, "units", void 0);
UnitTable = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'unit-table',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdatadrilldown/unittable.html"*/'<div class="reporting-selection table">\n  <ion-row *ngIf="units.length > 0" class="table-header">\n    <ion-col col-6 col-md-2>\n      <div class="list-header" item-left>\n        Unit\n      </div>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <div class="list-header" item-left>\n        Score\n      </div>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <div class="list-header" item-left>\n        Items Inspected\n      </div>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <div class="list-header" item-left>\n        Potential Revenue\n      </div>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <div class="list-header" item-left>\n        Highest\n      </div>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <div class="list-header" item-left>\n        Lowest\n      </div>\n    </ion-col>\n  </ion-row>\n  <ion-row *ngFor="let unit of units">\n    <ion-col col-6 col-md-2>\n      <p class="unit-name">{{unit.name}}</p>\n      <p>{{unit.unitTemplate.displayName}}</p>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <p *ngIf="dataProvider.dataByUnit[unit._id].score">\n        {{dataProvider.dataByUnit[unit._id].score | number:\'1.2-2\'}}\n      </p>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <p *ngIf="dataProvider.dataByUnit[unit._id].inspectedCount">\n        {{dataProvider.dataByUnit[unit._id].inspectedCount}}\n      </p>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <p *ngIf="dataProvider.dataByUnit[unit._id].potentialRevenue">\n        {{dataProvider.dataByUnit[unit._id].potentialRevenue | currency:\'USD\':true:\'1.0-0\'}}\n      </p>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <span *ngIf="dataProvider.dataByUnit[unit._id].roomScores.length">\n        <p>{{dataProvider.dataByUnit[unit._id].roomScores[0].name}}</p>\n      </span>\n    </ion-col>\n    <ion-col col-3 col-md-2>\n      <span *ngIf="dataProvider.dataByUnit[unit._id].roomScores.length > 1">\n        <p>{{dataProvider.dataByUnit[unit._id].roomScores[dataProvider.dataByUnit[unit._id].roomScores.length-1].name}}</p>\n      </span>\n    </ion-col>\n  </ion-row>\n</div>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/superdatadrilldown/unittable.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__providers_data__["a" /* Data */]])
], UnitTable);

//# sourceMappingURL=unittable.js.map

/***/ }),

/***/ 70:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InspectionCreatorPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_camera__ = __webpack_require__(245);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_image_resizer__ = __webpack_require__(250);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_file__ = __webpack_require__(248);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__popovertrade_popovertrade__ = __webpack_require__(253);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__popoverinsdate_popoverinsdate__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_data__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__providers_auth_service__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__providers_dropbox_dropbox__ = __webpack_require__(135);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// Note that the suggestion to use ChangeDectorRef for iOS issues
// comes from http://stackoverflow.com/questions/40337947/angular-2-list-is-not-refresh-on-running-ios











var InspectionCreatorPage = (function () {
    function InspectionCreatorPage(navCtrl, popoverCtrl, navParams, dataProvider, /*private cdRef: ChangeDetectorRef,*/ camera, file, plt, auth /*, private zone: NgZone*/, dropbox, toast, alertCtrl, imageResize) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.popoverCtrl = popoverCtrl;
        this.navParams = navParams;
        this.dataProvider = dataProvider;
        this.camera = camera;
        this.file = file;
        this.plt = plt;
        this.auth = auth; /*, private zone: NgZone*/
        this.dropbox = dropbox;
        this.toast = toast;
        this.alertCtrl = alertCtrl;
        this.imageResize = imageResize;
        console.log('This device has platforms: ' + this.plt.platforms());
        // In case the page is opened without a unit provided to the router
        this.unit = {
            _id: '',
            name: ''
        };
        this.doughnutChartSettings = {
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                cutoutPercentage: "75",
                aspectRatio: 1
            }
        };
        this.showImageLoading = [];
        this.showView = "roomselection";
        // Have to use metadata reference in order to change child values in popover and affect the inspection creator component
        this.metadata = {
            currentRoomID: '',
            currentTradeID: '',
            currentTradeIndex: 0,
            selectedItem: {},
            applyToAll: false,
            loadCompleted: false,
            saveCurrentItem: function (roomID, itemID) {
                var itemName = _this.dataProvider.inspectionTemplate.data[roomID].data[itemID].Item;
                if (_this.dataProvider.currentUnsavedItemData !== null) {
                    var username = _this.auth.currentUser.username;
                    var roomList = [roomID];
                    if (_this.metadata.applyToAll) {
                        roomList = _this.dataProvider.findAllRooms(roomID, itemID);
                    }
                    console.log('Saving this roomList: ' + roomList);
                    _this.dataProvider.saveCurrentUnsavedItemData(username, roomList, itemID)
                        .then(function () {
                        _this.invokeSavePopup(itemName);
                    })
                        .catch(function (err) {
                        var alert = _this.alertCtrl.create({
                            title: 'Save failed',
                            subTitle: 'Please try fully restarting the app and trying that input again',
                            buttons: ['Ok']
                        });
                        alert.present();
                    });
                }
            }
        };
        this.typeConditionStructure = {};
        this.showTips = false;
        this.tipsIcon = 'ios-arrow-down';
    }
    InspectionCreatorPage.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.metadata.loadCompleted = false;
        this.showImageLoading.splice(0);
        var noInspectionLoad = this.navParams.get('noInspectionLoad');
        var unit = this.navParams.get('unit');
        if ((typeof (unit) !== 'undefined') && (typeof (unit._id) !== 'undefined')) {
            this.unit = unit;
            if ((typeof (noInspectionLoad) === 'undefined') || (noInspectionLoad === false)) {
                this.dataProvider.getInspections(unit).then(function (inspections) {
                    if ((inspections.length) && (inspections.length > 0)) {
                        // Example use of creating a new visit object when entering the inspector creator and one doesn't exist yet
                        /*
                         if (this.dataProvider.currentVisit === null) {
                         this.dataProvider.createNewVisitAndSetCurrent(inspections[0]._id, this.auth.currentUser.username).then(result => {
                         console.log('Current visit is ' + this.dataProvider.currentVisit);
                         });
                         }
                         */
                        // The template code should block rendering by waiting for data inside the appropriate structures
                        // But after the template and visit data is gathered then we mark items in the inspection creator as complete if they have data
                        Promise.all([_this.dataProvider.getTemplateById(inspections[0].templateID), _this.dataProvider.getVisitData(inspections[0])])
                            .then(function () {
                            _this.dataProvider.getAllTemplatesPreferences(_this.auth.currentUser.username)
                                .then(function (result) {
                                _this.metadata.currentTmplPrefs = result;
                                _this.metadata.loadCompleted = true;
                            });
                        });
                    }
                    else {
                        _this.metadata.loadCompleted = true;
                    }
                });
            }
            else {
                this.metadata.loadCompleted = true;
            }
        }
        else {
            this.metadata.loadCompleted = true;
        }
    };
    // This is the method for pics being added now (html5 input method)
    InspectionCreatorPage.prototype.imageFileInputChanged = function (fileInput) {
        var _this = this;
        if (fileInput.target.files && fileInput.target.files[0]) {
            this.showImageLoading.push(true);
            var roomIDForPic_1 = this.metadata.currentRoomID;
            var itemIDForPic_1 = this.metadata.selectedItem._id;
            if (!this.dataProvider.inspectionData.data[roomIDForPic_1].data[itemIDForPic_1].images) {
                this.dataProvider.inspectionData.data[roomIDForPic_1].data[itemIDForPic_1].images = {};
                this.dataProvider.roomStructure[roomIDForPic_1].data.itemsObj[itemIDForPic_1].imageKeys = [];
            }
            var date = new Date();
            var fileID = date.getTime();
            var filename_1 = itemIDForPic_1 + '-' + this.auth.currentUser.username + fileID;
            filename_1 = filename_1.split('/').join('_');
            var thumb400Name_1 = filename_1 + '-thumb480.jpg';
            var thumb800Name_1 = filename_1 + '-thumb768.jpg';
            filename_1 = filename_1 + '.jpg';
            var roomName = roomIDForPic_1;
            roomName = roomName.split('/').join('_');
            var unitName = this.dataProvider.inspectionData.propertyName;
            unitName = unitName.split('/').join('_');
            var inspectionName = this.dataProvider.inspectionData.name;
            inspectionName = inspectionName.split('/').join('_');
            var folder_1 = '/' + unitName + '/' + inspectionName + '/' + roomName;
            var thumbFolder_1 = folder_1 + '/_thumbnails';
            // So the idea here is that we upload the image from the device, then we start 3 processes in parallel
            // 1) Create a share link for the original full size photo
            // 2) Get Dropbox to create a 480px thumbnail, upload that thumbnail, and return the share link
            // 3) Get Dropbox to create a 768px thumbnail, upload that thumbnail, and return the share link
            // When those 3 processes are all done then the system should create the pic object in memory and add the db record with all links
            this.dropbox.upload(filename_1, fileInput.target.files[0], folder_1)
                .then(function (result) {
                var fullSrcLinkPromise = _this.dropbox.createShareLink(folder_1 + '/' + filename_1);
                var thumb400LinkPromise = _this.dropbox.filesGetThumbnail(folder_1 + '/' + filename_1, 'w640h480')
                    .then(function (thumb400Response) {
                    return _this.dropbox.upload(thumb400Name_1, thumb400Response.fileBlob, thumbFolder_1)
                        .then(function (thumb400Upload) {
                        return _this.dropbox.createShareLink(thumbFolder_1 + '/' + thumb400Name_1);
                    });
                });
                var thumb800LinkPromise = _this.dropbox.filesGetThumbnail(folder_1 + '/' + filename_1, 'w1024h768')
                    .then(function (thumb800Response) {
                    return _this.dropbox.upload(thumb800Name_1, thumb800Response.fileBlob, thumbFolder_1)
                        .then(function (thumb800Upload) {
                        return _this.dropbox.createShareLink(thumbFolder_1 + '/' + thumb800Name_1);
                    });
                });
                var currentVisitPromise = _this.dataProvider.createNewVisitOrReturnCurrent(_this.auth.currentUser.username);
                return Promise.all([fullSrcLinkPromise, thumb400LinkPromise, thumb800LinkPromise, currentVisitPromise])
                    .then(function (resultArray) {
                    var newPic = {
                        _id: new Date().getTime(),
                        src: resultArray[0].url.split('www.dropbox').join('dl.dropboxusercontent'),
                        thumb400: resultArray[1].url.split('www.dropbox').join('dl.dropboxusercontent'),
                        thumb800: resultArray[2].url.split('www.dropbox').join('dl.dropboxusercontent'),
                        fullpath: '/' + _this.auth.currentUser.username + folder_1 + '/' + filename_1
                    };
                    console.log('Got all dropbox image links. Full path to main image is: ' + newPic.fullpath);
                    _this.dataProvider.roomStructure[roomIDForPic_1].data.itemsObj[itemIDForPic_1].imageKeys.unshift(newPic._id);
                    _this.dataProvider.inspectionData.data[roomIDForPic_1].data[itemIDForPic_1].images[newPic._id] = newPic;
                    fileInput.target.value = '';
                    // We are going to directly create a db record for each image because images are the most resource intensive operation
                    var newVisitItem = {
                        images: {}
                    };
                    newVisitItem.images[newPic._id] = newPic;
                    var roomList = [roomIDForPic_1];
                    if (_this.metadata.applyToAll) {
                        roomList = _this.dataProvider.findAllRooms(roomIDForPic_1, itemIDForPic_1);
                    }
                    var itemDataCopy = JSON.parse(JSON.stringify(newVisitItem));
                    return _this.dataProvider.createNewVisitData(resultArray[3]._id, roomList, itemIDForPic_1, itemDataCopy)
                        .then(function () {
                        var itemName = _this.dataProvider.inspectionTemplate.data[roomIDForPic_1].data[itemIDForPic_1].Item;
                        _this.invokeSavePopup(itemName);
                        _this.showImageLoading.splice(-1);
                        //this.cdRef.detectChanges();
                        return newPic;
                    })
                        .catch(function (err) {
                        var alert = _this.alertCtrl.create({
                            title: 'Save failed',
                            subTitle: 'Please try fully restarting the app and trying that input again',
                            buttons: ['Dismiss']
                        });
                        alert.present();
                    });
                });
            });
        }
    };
    InspectionCreatorPage.prototype.naChoiceOnChange = function (checked) {
        //this.zone.run(() => {
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        this.dataProvider.currentUnsavedItemData.naChoice = checked;
        if (checked) {
            this.dataProvider.currentUnsavedItemData.markSectionComplete = true;
            this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id].markSectionComplete = true;
            this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        }
        this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id].naChoice = checked;
        //});
    };
    InspectionCreatorPage.prototype.commentsOnBlur = function (newText) {
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        this.dataProvider.currentUnsavedItemData.mergedComments = newText;
        this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        //this.cdRef.detectChanges();
    };
    //Here is latest stab at using camera plugin and filesystem/transfer
    // If we need to save/access files there are some ideas here:
    //https://stackoverflow.com/questions/43723172/ionic-2-save-camera-picture-to-javascript-file-object-for-upload
    // Note that the view code is conditioned right now on the platform, so this function should only be happening on devices
    // Example stats, on David's ipad Air a 100 quality full size pic is 2.8MB, 2592 × 1936 pixels
    // a 50% qual full res pic is 387KB, 2592 × 1936 pixels
    // In a Kim ChaseNR example pic, what we were uploading with HTML5 before is 1.3MB, 3024 × 4032 pixels
    // Then the biggest resize we were creating is 42KB, 576 × 768 pixels
    // With my new experiment, setting qual 100 and targetWid 1024, targHei 768 I got a 777KB, 1024 × 764 pixels
    // Note, when I set targ width 576 and took pic landscape I got a 576x430px and
    // on that setting I took portrait and got a 573×768px
    // So the targWidth setting  is used for largest dimension in landscape, and
    // the targHeight setting is the largest dimension in portrait
    // For best tradeoff of quality and size, Joe and I picked 60% image quality with 1024 as the largest dimension for the main
    // photo and 640 as the largest dimension on the smaller thumbnail.
    InspectionCreatorPage.prototype.addNewPic = function () {
        var _this = this;
        var picQuality = 60;
        if (this.camera) {
            var cameraOptions = {
                quality: picQuality,
                destinationType: this.camera.DestinationType.FILE_URI,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                saveToPhotoAlbum: true,
                correctOrientation: true,
                targetWidth: 1024,
                targetHeight: 1024
            };
            var roomIDForPic_2 = this.metadata.currentRoomID;
            var itemIDForPic_2 = this.metadata.selectedItem._id;
            var date = new Date();
            var fileID_1 = date.getTime();
            var filename_2 = itemIDForPic_2 + '-' + this.auth.currentUser.username + fileID_1;
            filename_2 = filename_2.split('/').join('_');
            var thumb400Name_2 = filename_2 + '-thumb480.jpg';
            //let thumb800Name = filename + '-thumb768.jpg';
            filename_2 = filename_2 + '.jpg';
            var roomName = roomIDForPic_2;
            roomName = roomName.split('/').join('_');
            var unitName = this.dataProvider.inspectionData.propertyName;
            unitName = unitName.split('/').join('_');
            var inspectionName = this.dataProvider.inspectionData.name;
            inspectionName = inspectionName.split('/').join('_');
            var folder_2 = '/' + unitName + '/' + inspectionName + '/' + roomName;
            var thumbFolder_2 = folder_2 + '/_thumbnails';
            var newBaseFilesystemPath_1 = this.file.dataDirectory;
            this.camera.getPicture(cameraOptions)
                .then(function (tempOrigFileURI) {
                _this.showImageLoading.push(true);
                if (!_this.dataProvider.inspectionData.data[roomIDForPic_2].data[itemIDForPic_2].images) {
                    _this.dataProvider.inspectionData.data[roomIDForPic_2].data[itemIDForPic_2].images = {};
                    _this.dataProvider.roomStructure[roomIDForPic_2].data.itemsObj[itemIDForPic_2].imageKeys = [];
                }
                // We pass in 640,640 for size because orientation gives maxSize for a dimension
                var resizeOptions = {
                    uri: tempOrigFileURI,
                    //folderName: 'Example',//Supposed to be needed on Android
                    quality: picQuality,
                    width: 640,
                    height: 640,
                    fileName: thumb400Name_2
                };
                var thumbPromise = _this.imageResize.resize(resizeOptions)
                    .then(function (tempThumbURI) {
                    console.log('Temp path of resized thumb ', tempThumbURI);
                    // This logic below is to move file out of temp storage: https://ionicframework.com/blog/storing-photos-with-the-cordova-camera-and-file-plugins/
                    var tempThumbFilename = tempThumbURI.substr(tempThumbURI.lastIndexOf('/') + 1);
                    var tempBaseFilesystemPath = tempThumbURI.substr(0, tempThumbURI.lastIndexOf('/') + 1);
                    // We need to have unique filenames (with proper file type endings too)
                    var newThumbName = fileID_1 + "-thumb400-" + tempThumbFilename;
                    return _this.file.copyFile(tempBaseFilesystemPath, tempThumbFilename, newBaseFilesystemPath_1, newThumbName)
                        .then(function () {
                        var storedThumbURI = newBaseFilesystemPath_1 + newThumbName;
                        console.log('Perm path of resized thumb ', storedThumbURI);
                        // Now that we have offline-first photos working, we can return/display it now - then try Dropbox upload later
                        return ({ url: storedThumbURI });
                        // If this is uncommented below it will block the UI-thread to try to upload immediately
                        /*return this.dropbox.uploadAPI(thumb400Name, storedThumbURI, thumbFolder)
                        .then(() => {
                          return this.dropbox.createShareLink(thumbFolder + '/' + thumb400Name);
                        });*/
                    });
                })
                    .catch(function (e) { console.error(e.message ? e.message : e); return false; });
                // This logic below is to move file out of temp storage: https://ionicframework.com/blog/storing-photos-with-the-cordova-camera-and-file-plugins/
                // Extract just the filename. Result example: cdv_photo_003.jpg
                var tempFilename = tempOrigFileURI.substr(tempOrigFileURI.lastIndexOf('/') + 1);
                // Now, the opposite. Extract the full path, minus filename.
                // Result example: file:///var/mobile/Containers/Data/Application
                // /E4A79B4A-E5CB-4E0C-A7D9-0603ECD48690/tmp/
                var tempBaseFilesystemPath = tempOrigFileURI.substr(0, tempOrigFileURI.lastIndexOf('/') + 1);
                // Get the Data directory on the device with this.file.dataDirectory
                // Result example: file:///var/mobile/Containers/Data/Application
                // /E4A79B4A-E5CB-4E0C-A7D9-0603ECD48690/Library/NoCloud/
                // Commented out because it is declared at the top of the function
                //const newBaseFilesystemPath = this.file.dataDirectory;
                // We need to have unique filenames (with proper file type endings too)
                var newFileName = fileID_1 + "-" + tempFilename;
                var originalPromise = _this.file.copyFile(tempBaseFilesystemPath, tempFilename, newBaseFilesystemPath_1, newFileName)
                    .then(function () {
                    var storedOrigURI = newBaseFilesystemPath_1 + newFileName;
                    // Now that we have offline-first photos working, we can return/display it now - then try Dropbox upload later
                    return { url: storedOrigURI };
                    // If this is uncommented below it will block the UI-thread to try to upload immediately
                    // This call uploads to dropbox using the Cordova Transfer plugin and the Dropbox REST API
                    /*return this.dropbox.uploadAPI(filename, storedOrigURI, folder)
                    .then(() => {
                      return this.dropbox.createShareLink(folder + '/' + filename);
                    });*/
                });
                var currentVisitPromise = _this.dataProvider.createNewVisitOrReturnCurrent(_this.auth.currentUser.username);
                return Promise.all([originalPromise, thumbPromise, currentVisitPromise])
                    .then(function (resultArray) {
                    var mainPicURL = "";
                    var thumb400URL = "";
                    var localOrigURI = "";
                    var localThumbURI = "";
                    if (resultArray[0].url.includes("www.dropbox")) {
                        mainPicURL = resultArray[0].url.split('www.dropbox').join('dl.dropboxusercontent');
                    }
                    else {
                        localOrigURI = resultArray[0].url;
                    }
                    if (resultArray[1].url.includes("www.dropbox")) {
                        thumb400URL = resultArray[1].url.split('www.dropbox').join('dl.dropboxusercontent');
                    }
                    else {
                        localThumbURI = resultArray[1].url;
                    }
                    var newPic = {
                        _id: new Date().getTime(),
                        origFilename: filename_2,
                        origFolder: folder_2,
                        thumbFilename: thumb400Name_2,
                        thumbFolder: thumbFolder_2,
                        userFolder: '/' + _this.auth.currentUser.username
                    };
                    if (mainPicURL !== "") {
                        newPic.src = mainPicURL;
                        newPic.thumb800 = mainPicURL;
                        newPic.origUploaded = true;
                    }
                    if (thumb400URL !== "") {
                        newPic.thumb400 = thumb400URL;
                        newPic.thumbUploaded = true;
                    }
                    if (localOrigURI !== "") {
                        newPic.localOrigURI = localOrigURI;
                        newPic.origUploaded = false;
                    }
                    if (localThumbURI !== "") {
                        newPic.localThumbURI = localThumbURI;
                        newPic.thumbUploaded = false;
                    }
                    var fullpath = '/' + _this.auth.currentUser.username + folder_2 + '/' + filename_2;
                    console.log('Got all dropbox image links. Full path to main image is: ' + fullpath);
                    _this.dataProvider.roomStructure[roomIDForPic_2].data.itemsObj[itemIDForPic_2].imageKeys.unshift(newPic._id);
                    _this.dataProvider.inspectionData.data[roomIDForPic_2].data[itemIDForPic_2].images[newPic._id] = newPic;
                    // We are going to directly create a db record for each image because images are the most resource intensive operation
                    var newVisitItem = {
                        images: {}
                    };
                    newVisitItem.images[newPic._id] = newPic;
                    var roomList = [roomIDForPic_2];
                    if (_this.metadata.applyToAll) {
                        roomList = _this.dataProvider.findAllRooms(roomIDForPic_2, itemIDForPic_2);
                    }
                    var itemDataCopy = JSON.parse(JSON.stringify(newVisitItem));
                    return _this.dataProvider.createNewVisitData(resultArray[2]._id, roomList, itemIDForPic_2, itemDataCopy)
                        .then(function () {
                        var itemName = _this.dataProvider.inspectionTemplate.data[roomIDForPic_2].data[itemIDForPic_2].Item;
                        _this.invokeSavePopup(itemName);
                        _this.showImageLoading.splice(-1);
                        //this.cdRef.detectChanges();
                        // Now that the local photo is saved/displayed, we can try a first shot at Dropbox uploads (non-blocking)
                        if (newPic.localThumbURI && !newPic.thumbUploaded) {
                            var thumbDataCopy_1 = JSON.parse(JSON.stringify(newVisitItem));
                            _this.dropbox.uploadAPI(thumb400Name_2, newPic.localThumbURI, thumbFolder_2)
                                .then(function () {
                                return _this.dropbox.createShareLink(thumbFolder_2 + '/' + thumb400Name_2)
                                    .then(function (thumbResult) {
                                    if (thumbResult.url.includes("www.dropbox")) {
                                        console.log("After offline save, succesful upload and link made for thumb: " + thumbFolder_2 + '/' + thumb400Name_2);
                                        thumb400URL = thumbResult.url.split('www.dropbox').join('dl.dropboxusercontent');
                                        var newThumbPic = {};
                                        newThumbPic._id = newPic._id;
                                        newThumbPic.thumb400 = thumb400URL;
                                        newThumbPic.thumbUploaded = true;
                                        thumbDataCopy_1.images[newThumbPic._id] = newThumbPic;
                                        _this.dataProvider.createNewVisitData(resultArray[2]._id, roomList, itemIDForPic_2, thumbDataCopy_1);
                                    }
                                });
                            });
                        }
                        if (newPic.localOrigURI && !newPic.origUploaded) {
                            _this.dropbox.uploadAPI(filename_2, newPic.localOrigURI, folder_2)
                                .then(function () {
                                return _this.dropbox.createShareLink(folder_2 + '/' + filename_2)
                                    .then(function (origResult) {
                                    if (origResult.url.includes("www.dropbox")) {
                                        console.log("After offline save, succesful upload and link made for orig: " + folder_2 + '/' + filename_2);
                                        mainPicURL = origResult.url.split('www.dropbox').join('dl.dropboxusercontent');
                                        var newOrigPic = {};
                                        newOrigPic._id = newPic._id;
                                        newOrigPic.src = mainPicURL;
                                        newOrigPic.thumb800 = mainPicURL;
                                        newOrigPic.origUploaded = true;
                                        itemDataCopy.images[newOrigPic._id] = newOrigPic;
                                        _this.dataProvider.createNewVisitData(resultArray[2]._id, roomList, itemIDForPic_2, itemDataCopy);
                                    }
                                });
                            });
                        }
                        return newPic;
                    })
                        .catch(function (err) {
                        var alert = _this.alertCtrl.create({
                            title: 'Save failed',
                            subTitle: 'Please try fully restarting the app and trying that input again',
                            buttons: ['Dismiss']
                        });
                        alert.present();
                    });
                });
            })
                .catch(function (error) {
                console.error(error.message ? error.message : error);
            });
        }
        else {
            console.error('no camera available');
        }
    };
    InspectionCreatorPage.prototype.markItemComplete = function (itemID) {
        this.showTips = false;
        this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[itemID].markSectionComplete = true;
        //Example of creating new visit data doc after item is marked complete
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        this.dataProvider.currentUnsavedItemData.markSectionComplete = true;
        this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        var nextItem = null;
        for (var index = 0; index < this.dataProvider.templateStructure[this.metadata.currentRoomID].itemsByTrade[this.metadata.currentTradeID].length; index++) {
            var item = this.dataProvider.templateStructure[this.metadata.currentRoomID].itemsByTrade[this.metadata.currentTradeID][index];
            if (item._id === itemID) {
                nextItem = this.dataProvider.templateStructure[this.metadata.currentRoomID].itemsByTrade[this.metadata.currentTradeID][index + 1];
                break;
            }
        }
        if (nextItem === null || nextItem === undefined) {
            nextItem = this.dataProvider.templateStructure[this.metadata.currentRoomID].itemsByTrade[this.metadata.currentTradeID][0];
        }
        // Passing true in order to skip saving
        this.selectItem(nextItem, true);
    };
    // Need to see if the room exists in the roomStructure before we navigate to a room
    // because roomStructure holds previously created visit data and it is also where we will databound current input.
    // So if there isn't already previous visitData about a room then we need to create the object for the room to hold new data.
    // Also need to do the same for the first item in the room
    InspectionCreatorPage.prototype.showRoomEditor = function (roomID) {
        //this.zone.run(() => {
        var firstTradeIDNewRoom = this.dataProvider.templateStructure[roomID].tradeIDs[0];
        var firstItemInNewRoom = this.dataProvider.templateStructure[roomID].itemsByTrade[firstTradeIDNewRoom][0];
        this.dataProvider.createItemStructIfNotExist(roomID, firstItemInNewRoom._id);
        this.metadata.currentRoomID = roomID;
        this.metadata.currentTradeID = firstTradeIDNewRoom;
        this.metadata.applyToAll = false;
        this.metadata.selectedItem = firstItemInNewRoom;
        this.showView = "roomeditor";
        this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id].hospitalityRating += '';
        //});
    };
    // Need to see if the item exists in the roomStructure before we navigate to an item
    // because roomStructure holds previously created visit data and it is also where we will databound current input.
    // So if there isn't already previous visitData about a room then we need to create the object for the room to hold new data
    InspectionCreatorPage.prototype.selectItem = function (item, skipSave) {
        //this.zone.run(() => {
        if (!skipSave) {
            this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        }
        this.showTips = false;
        this.dataProvider.createItemStructIfNotExist(this.metadata.currentRoomID, item._id);
        this.metadata.applyToAll = false;
        this.metadata.selectedItem = item;
        this.content.scrollToTop(0);
        //this.cdRef.detectChanges();
        //});
    };
    InspectionCreatorPage.prototype.selectConditionGroup = function (conditionGroupID) {
        //this.zone.run(() => {
        this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        //});
    };
    // Not using this function yet; but the idea is to great ready to store sub option data
    /*
     selectTypeConditionGroup(itemID, conditionID) {
     if (typeof(this.typeConditionStructure[itemID]) === 'undefined') {
     this.typeConditionStructure[itemID] = {};
     }
     if (typeof(this.typeConditionStructure[itemID][conditionID]) === 'undefined') {
     this.typeConditionStructure[itemID][conditionID] = {};
     }
     }*/
    InspectionCreatorPage.prototype.showRoomSelection = function () {
        this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        this.showView = "roomselection";
        this.metadata.currentRoomID = '';
        this.metadata.currentTradeIndex = 0;
        //this.cdRef.detectChanges();
    };
    InspectionCreatorPage.prototype.showPropertyInspection = function () {
        this.navCtrl.pop();
    };
    InspectionCreatorPage.prototype.openPopover = function (myEvent) {
        var popover = this.popoverCtrl.create(__WEBPACK_IMPORTED_MODULE_5__popovertrade_popovertrade__["a" /* PopoverTradePage */], { metadata: this.metadata });
        popover.present({
            ev: myEvent
        });
    };
    InspectionCreatorPage.prototype.openDatePopover = function (myEvent) {
        var popover = this.popoverCtrl.create(__WEBPACK_IMPORTED_MODULE_6__popoverinsdate_popoverinsdate__["a" /* PopoverinsdatePage */], {});
        popover.present({
            ev: myEvent
        });
    };
    /**
     * Removes all occurrences of forward slashes, spaces, and pound sign and any following numbers.
     * This is because some characters are not allowed in file names.
     * @param roomID Passed in from HTML.
     * @returns {string} SRC for icon in assets
     */
    InspectionCreatorPage.prototype.getIconSrc = function (roomID) {
        var cleanID = roomID.replace(/[\/ ]+/g, '').toLowerCase();
        if (cleanID.indexOf('#') > -1) {
            cleanID = cleanID.substring(0, cleanID.indexOf('#'));
        }
        if (cleanID.indexOf('bathroom') > -1) {
            cleanID = 'bathroom';
        }
        if (cleanID.indexOf('bedroom') > -1) {
            cleanID = 'bedroom';
        }
        return 'assets/icon/' + cleanID + '.svg';
    };
    /**
     * Shows and hides the TIPS section and toggles the arrow icon
     */
    InspectionCreatorPage.prototype.toggleTips = function () {
        this.showTips = !this.showTips;
        if (this.showTips) {
            this.tipsIcon = 'ios-arrow-up';
        }
        else {
            this.tipsIcon = 'ios-arrow-down';
        }
    };
    /* Updates the inspectionData object with the textbox value and creates the subobject if necessary.
     * @param event
     * @param conditionID
     * @param optionID
     */
    InspectionCreatorPage.prototype.updateOptionTextbox = function (event, conditionID, optionID) {
        if (!this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID]) {
            this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID] = {};
        }
        var dataCondition = this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID];
        if (this.dataProvider.currentUnsavedItemData === null) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        if (!dataCondition.optionID) {
            // create object matching the template for the option
            dataCondition[optionID] = {};
        }
        dataCondition[optionID]['textValue'] = event['target'].value;
        if (!this.dataProvider.currentUnsavedItemData.typesConditions) {
            this.dataProvider.currentUnsavedItemData.typesConditions = {};
        }
        if (!this.dataProvider.currentUnsavedItemData.typesConditions[conditionID]) {
            this.dataProvider.currentUnsavedItemData.typesConditions[conditionID] = {};
        }
        if (!this.dataProvider.currentUnsavedItemData.typesConditions[conditionID][optionID]) {
            this.dataProvider.currentUnsavedItemData.typesConditions[conditionID][optionID] = {};
        }
        this.dataProvider.currentUnsavedItemData.typesConditions[conditionID][optionID]['textValue'] = event['target'].value;
        //this.cdRef.detectChanges();
        // If we wanted to save on every interaction, then uncomment below
        //this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
    };
    /**
     * Needed because ternary ops eval to true in template and logic is long.
     * Also clinical is the only one missing a typesConditions object.
     * @param conditionID
     * @param subOption
     * @returns {boolean}
     */
    InspectionCreatorPage.prototype.subOptionHasData = function (conditionID, subOption) {
        if (!this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID]) {
            return false;
        }
        else if (!this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID][subOption['optionID']]) {
            return false;
        }
        return true;
    };
    /** Updates the inspectionData object with the checkbox value and adds the template object if necessary.
     * @param checked
     * @param conditionID
     * @param optionID
     */
    InspectionCreatorPage.prototype.checkboxTypeConditionOnSelect = function (checked, conditionID, optionID) {
        //this.zone.run(() => {
        if (!this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID]) {
            this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID] = {};
        }
        var dataCondition = this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id]['typesConditions'][conditionID];
        if (this.dataProvider.currentUnsavedItemData === null) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        if (!dataCondition.optionID) {
            // create object matching the template for the option
            dataCondition[optionID] = {};
        }
        dataCondition[optionID]['checkboxValue'] = checked;
        if (!this.dataProvider.currentUnsavedItemData.typesConditions) {
            this.dataProvider.currentUnsavedItemData.typesConditions = {};
        }
        if (!this.dataProvider.currentUnsavedItemData.typesConditions[conditionID]) {
            this.dataProvider.currentUnsavedItemData.typesConditions[conditionID] = {};
        }
        if (!this.dataProvider.currentUnsavedItemData.typesConditions[conditionID][optionID]) {
            this.dataProvider.currentUnsavedItemData.typesConditions[conditionID][optionID] = {};
        }
        this.dataProvider.currentUnsavedItemData.typesConditions[conditionID][optionID]['checkboxValue'] = checked;
        // If we wanted to save on every interaction, then uncomment below
        //this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        //});
    };
    // checkboxTypeConditionOnSelect(conditionID, optionID,checkboxValue) {
    //   console.log(conditionID, optionID,checkboxValue);
    // }
    InspectionCreatorPage.prototype.replacementTimelineOnSelect = function (timelineValue) {
        // console.log(timelineValue);
        var dataItem = this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id];
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        if (!this.dataProvider.currentUnsavedItemData.inspectionWorkTrackingConditions) {
            this.dataProvider.currentUnsavedItemData.inspectionWorkTrackingConditions = {};
        }
        this.dataProvider.currentUnsavedItemData.inspectionWorkTrackingConditions.selection = timelineValue;
        // If we wanted to save on every interaction, then uncomment below
        //this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        this.dataProvider.recalculateTimelineCounts(this.metadata.currentRoomID, dataItem['inspectionWorkTrackingConditions']['selection'], timelineValue);
        dataItem['inspectionWorkTrackingConditions']['selection'] = timelineValue;
        //this.cdRef.detectChanges();
    };
    InspectionCreatorPage.prototype.invokeSavePopup = function (itemName) {
        var toast = this.toast.create({
            message: itemName + ' was saved',
            duration: 3000,
            position: 'top',
        });
        toast.present();
    };
    InspectionCreatorPage.prototype.hospOnSelect = function (hospValue) {
        //this.zone.run(() => {
        var dataItem = this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id];
        this.dataProvider.recalculateRoomScore(this.metadata.currentRoomID, dataItem['hospitalityRating'], hospValue);
        dataItem['hospitalityRating'] = hospValue;
        // console.log(hospValue);
        if (!this.dataProvider.currentUnsavedItemData) {
            this.dataProvider.currentUnsavedItemData = {};
        }
        this.dataProvider.currentUnsavedItemData.hospitalityRating = hospValue;
        // If we wanted to save on every interaction, then uncomment below
        //this.metadata.saveCurrentItem(this.metadata.currentRoomID, this.metadata.selectedItem._id);
        //});
    };
    InspectionCreatorPage.prototype.setHospValue = function (newValue) {
        var dataItem = this.dataProvider.inspectionData.data[this.metadata.currentRoomID].data[this.metadata.selectedItem._id];
        this.hospOnSelect(newValue);
        dataItem['hospitalityRating'] = newValue;
    };
    return InspectionCreatorPage;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* Content */]),
    __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* Content */])
], InspectionCreatorPage.prototype, "content", void 0);
InspectionCreatorPage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'page-inspectioncreator',template:/*ion-inline-start:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/inspectioncreator/inspectioncreator.html"*/'<ion-header>\n  <ion-navbar align-title="center">\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title>\n      <img src="assets/img/mymarsi-logo-large.png" alt="MyMARSI logo" class="logo-mobile">\n    </ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding class="main">\n  <ion-grid *ngIf="(dataProvider.inspectionTemplate.roomOrder)&&(dataProvider.inspectionTemplate.data)&&(dataProvider.hospitalityStructure.chartColors)">\n    <ion-row class="page-nav">\n      <ion-col col-6>\n        <p>\n          <a *ngIf="showView === \'roomselection\'" (click)="showPropertyInspection()" class="clickable-element">\n            <p class="negative-margin inspector">\n              <ion-icon name="arrow-back"></ion-icon>\n              Change unit\n            </p>\n            <h2 class="page-header">{{unit.name}}</h2>\n            <p *ngIf="unit.unitTemplate"\n               class="negative-margin inspector">\n              {{unit.unitTemplate.displayName}}\n            </p>\n        </a>\n        <a *ngIf="showView === \'roomeditor\'"\n           (click)="showRoomSelection()"\n           class="clickable-element">\n          <h2 class="page-header opacity75">{{unit.name}}</h2>\n          <p *ngIf="unit.unitTemplate"\n             class="negative-margin inspector">\n            {{unit.unitTemplate.displayName}}\n          </p>\n        </a>\n        </p>\n\n      </ion-col>\n      <ion-col col-6 class="text-align-left">\n        <p class="label">Inspection</p>\n        <button *ngIf="dataProvider.inspectionObjList.data && dataProvider.inspectionObjList.data.length > 0" class="popover-menu"\n          (click)="openDatePopover($event)">\n          <span>\n            {{dataProvider.inspectionObjList.data[0].name}}\n          </span>\n          <ion-icon name="ios-arrow-down"></ion-icon>\n        </button>\n      </ion-col>\n    </ion-row>\n    <ng-container *ngIf="showView === \'roomselection\'">\n      <ion-row class="donut-header">\n        <ion-col col-6 col-md-3 class="donut-side">\n          <div class="graph" *ngIf="dataProvider.hospitalityStructure.count">\n            <canvas baseChart [data]="[(dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count),(10- (dataProvider.hospitalityStructure.sum / dataProvider.hospitalityStructure.count))]"\n              [chartType]="\'doughnut\'" [colors]="dataProvider.hospitalityStructure.chartColors" [options]="doughnutChartSettings.options"></canvas>\n            <div class="inside-donut">\n              <h2>\n                {{ dataProvider.hospitalityStructure.intPortion }}\n                <span class="decimals">{{ dataProvider.hospitalityStructure.remainderPortion }}</span>\n                <span class="label">Hospitality<br />Score</span>\n              </h2>\n            </div>\n          </div>\n        </ion-col>\n\n\n        <ion-col col-6 col-md-3>\n          <ion-row>\n            <ion-col class="align-right" col-6>\n              <h3>{{ dataProvider.issueStructure._itemsInspectedCount }}</h3>\n            </ion-col>\n            <ion-col class="align-left" col-6>\n              <p class="number-label">Items\n                <br />Inspected</p>\n            </ion-col>\n          </ion-row>\n          <ion-row>\n            <ion-col class="align-right" col-6>\n              <ul>\n                <ng-container *ngFor="let issueID of dataProvider.issueStructure[\'_keys\']">\n                  <li>{{ dataProvider.issueStructure[issueID].count }}</li>\n                </ng-container>\n              </ul>\n            </ion-col>\n            <ion-col class="align-left" col-6>\n              <ul>\n                  <ng-container *ngFor="let issueID of dataProvider.issueStructure[\'_keys\']; let i = index;">\n                      <li>{{ issueID }}</li>\n                    </ng-container>\n              </ul>\n            </ion-col>\n          </ion-row>\n        </ion-col>\n        <ion-col col-6 col-md-3>\n          <ion-row>\n            <ion-col>\n              <h4>HIGHEST</h4>\n              <p class="number-label">Room</p>\n              <ul class="ul-margin" *ngIf="dataProvider.sortedHospRatings.length">\n                <li><span class="list-score"> {{dataProvider.sortedHospRatings[dataProvider.sortedHospRatings.length-1].score | number:\'1.2-2\'}}</span> <span class="list-room">\n                  {{dataProvider.sortedHospRatings[dataProvider.sortedHospRatings.length-1].name}}</span></li>\n                <li  *ngIf="dataProvider.sortedHospRatings.length > 1">\n                  <span class="list-score">{{dataProvider.sortedHospRatings[dataProvider.sortedHospRatings.length-2].score | number:\'1.2-2\'}}</span> <span class="list-room"> {{dataProvider.sortedHospRatings[dataProvider.sortedHospRatings.length-2].name}}\n                  </span>\n                </li>\n              </ul>\n            </ion-col>\n\n          </ion-row>\n\n\n        </ion-col>\n        <ion-col col-6 col-md-3>\n          <ion-row>\n            <ion-col>\n              <h4>Lowest</h4>\n              <p class="number-label">Room</p>\n              <ul class="ul-margin" *ngIf="dataProvider.sortedHospRatings.length > 2">\n                  <li><span class="list-score">{{dataProvider.sortedHospRatings[0].score | number:\'1.2-2\'}}</span> <span class="list-room">\n                     {{dataProvider.sortedHospRatings[0].name}}</span></li>\n                  <li  *ngIf="dataProvider.sortedHospRatings.length > 3">\n                    <span class="list-score">{{dataProvider.sortedHospRatings[1].score | number:\'1.2-2\'}}</span> <span class="list-room"> {{dataProvider.sortedHospRatings[1].name}}</span>\n                  </li>\n                </ul>\n            </ion-col>\n\n          </ion-row>\n\n\n        </ion-col>\n      </ion-row>\n      <!--Room list view-->\n\n      <ion-row *ngIf="dataProvider.inspectionTemplate.roomOrder">\n        <ng-container *ngIf="dataProvider.inspectionTemplate.roomOrder.length > 0">\n          <ion-col col-6 col-sm-4 col-md-3 *ngFor="let roomID of dataProvider.inspectionTemplate.roomOrder">\n            <ion-card class="choose-room " (click)="showRoomEditor(roomID)" tappable>\n              <ion-card-header>\n\n                <h3>\n                  <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[roomID]">\n                    {{dataProvider.inspectionTemplate.roomAliases[roomID]}}\n                  </span>\n                  <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[roomID]">\n                    {{roomID}}\n                  </span>\n                </h3>\n              </ion-card-header>\n              <ion-card-content *ngIf="dataProvider.templateStructure[roomID]">\n\n                <img src="{{getIconSrc(roomID)}}" alt="room name" />\n                <ion-row class="donut-header">\n                  <ion-col class="align-right" col-6>\n                    <h3 *ngIf="dataProvider.roomStructure[roomID]?.data?.completedItemCount">\n                      {{ dataProvider.roomStructure[roomID].data.completedItemCount }}\n                    </h3>\n                    <h3 *ngIf="!dataProvider.roomStructure[roomID]?.data?.completedItemCount">\n                      0\n                    </h3>\n                  </ion-col>\n                  <ion-col class="align-left" col-6>\n                    <p class="number-label">Items\n                      <br />Inspected</p>\n                  </ion-col>\n                </ion-row>\n              </ion-card-content>\n            </ion-card>\n          </ion-col>\n        </ng-container>\n      </ion-row>\n    </ng-container>\n    <!--End of room list view-->\n    <!--Room editor view-->\n    <div class="label-fix">\n    <ng-container *ngIf="showView === \'roomeditor\'">\n      <ion-row class="sub page-nav">\n        <ion-col col-6>\n          <a *ngIf="showView === \'roomeditor\'"\n             (click)="showRoomSelection()"\n             class="clickable-element"\n             tappable>\n             <p class="link-back">\n               Change Room</p>\n            <h2 class="page-header inspection">\n\n              <span *ngIf="dataProvider.inspectionTemplate.roomAliases && dataProvider.inspectionTemplate.roomAliases[metadata.currentRoomID]">\n                {{dataProvider.inspectionTemplate.roomAliases[metadata.currentRoomID]}}\n              </span>\n              <span *ngIf="!dataProvider.inspectionTemplate.roomAliases || !dataProvider.inspectionTemplate.roomAliases[metadata.currentRoomID]">\n                {{metadata.currentRoomID}}\n              </span>\n            </h2>\n\n          </a>\n        </ion-col>\n        <ion-col col-6 class="text-align-left margin-top-fix">\n          <!--<p class="label">CATEGORY</p>-->\n          <button id="tradePopoverBtn" class="popover-menu" (click)="openPopover($event)">\n            {{metadata.currentTradeID}}\n            <ion-icon name="ios-arrow-down"></ion-icon>\n\n          </button>\n        </ion-col>\n\n      </ion-row>\n      <ion-row *ngIf="metadata.loadCompleted">\n        <ion-col col-12 col-md-3 class="inspection-nav">\n          <ion-list class="report-builder">\n            <p *ngFor="let item of dataProvider.templateStructure[metadata.currentRoomID].itemsByTrade[metadata.currentTradeID]" (click)="selectItem(item)"\n              [ngStyle]="{\'font-weight\': metadata.currentTmplPrefs.boldedItems && metadata.currentTmplPrefs.boldedItems[metadata.currentRoomID] && metadata.currentTmplPrefs.boldedItems[metadata.currentRoomID][item._id] ? \'bold\': \'normal\'}"\n              [ngClass]="{\'current\': metadata.selectedItem._id === item._id, \'completed\': dataProvider.inspectionData.data[metadata.currentRoomID]?.data[item._id]?.markSectionComplete }"\n              [attr.color]="dataProvider.inspectionData.data[metadata.currentRoomID]?.data[item._id]?.markSectionComplete ? \'secondary\' : null">\n              <ion-icon class="completed" *ngIf="dataProvider.inspectionData.data[metadata.currentRoomID]?.data[item._id]?.markSectionComplete" name="checkmark-circle"></ion-icon>\n              {{item.Item}}\n            </p>\n          </ion-list>\n        </ion-col>\n        <ion-col col-12 col-md-9 >\n          <ion-row tappable (click)="toggleTips()" align-items-center>\n            <ion-col col-6>\n              <h2 class="page-header">{{metadata.selectedItem.Item}} <ion-icon name="{{tipsIcon}}"></ion-icon>\n              </h2>\n            </ion-col>\n\n          </ion-row>\n          <ion-row class="hidden-row-rules">\n            <ion-col>\n              <div class="tips-rules">\n                <p *ngIf="showTips" class="appearing-tips">{{metadata.selectedItem[\'TIPS\']}}</p>\n                <div *ngIf="metadata.selectedItem[\'Rules\']" class="company-rules">\n                  <ion-icon name="alert"></ion-icon>\n                  <p>{{metadata.selectedItem[\'Rules\']}}</p>\n                </div>\n              </div>\n            </ion-col>\n\n          </ion-row>\n          <ion-row class="question-answer-block ">\n            <ion-col class="question-block call-out" col-6>\n              <ion-checkbox #naChk\n                            [(ngModel)]="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'naChoice\']"\n                            (ngModelChange)="naChoiceOnChange(naChk.checked)">\n              </ion-checkbox>\n              <ion-label>Not in unit</ion-label>\n            </ion-col>\n          </ion-row>\n          <!-- Kim requested just to enable this on surfaces to start -->\n          <ion-row *ngIf="metadata.selectedItem[\'Trade or Service\'] === \'Surfaces\'" class="question-answer-block">\n            <ion-col class="question-block call-out" col-6>\n              <ion-checkbox [(ngModel)]="metadata.applyToAll"></ion-checkbox>\n                <ion-label>Apply same information below for {{metadata.selectedItem.Item.toLowerCase()}} in all rooms</ion-label>\n            </ion-col>\n          </ion-row>\n          <!--TODO new pic slides-->\n          <div [ngClass]="{\'not-in-property\': dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'naChoice\']}">\n            <ion-row>\n              <ion-col col-12>\n                <ion-slides *ngIf="dataProvider.roomStructure[metadata.currentRoomID].data.itemsObj[metadata.selectedItem._id]?.imageKeys?.length"\n                  pager slidesPerView="3" spaceBetween="5px">\n                  <ng-container *ngFor="let imageID of dataProvider.roomStructure[metadata.currentRoomID].data.itemsObj[metadata.selectedItem._id].imageKeys">\n                    <ion-slide *ngIf="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id].images[imageID].thumb400 ">\n                      <img width="100%" height="auto" [src]="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id].images[imageID].thumb400"\n                      />\n                    </ion-slide>\n                    <ion-slide *ngIf="!(dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id].images[imageID].thumb400) && dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id].images[imageID].localOrigURI">\n                      <img width="100%" height="auto" [src]="dataProvider.fileURIasSrc(dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id].images[imageID].localOrigURI)"\n                      />\n                    </ion-slide>\n                  </ng-container>\n                </ion-slides>\n                <ng-container *ngFor="let spin of showImageLoading">\n                  <ion-spinner></ion-spinner>\n                </ng-container>\n              </ion-col>\n              <!-- Can use this code to conditional use the camera plugin or the html5 input depending on platform -->\n              <!-- On-device used to be !(plt.is(\'mobileweb\')) && !(plt.is(\'core\')) -->\n              <ion-col *ngIf="(false)" (click)="addNewPic()">\n                <ion-item tappable>\n                  <div class="add-picture">\n                    <ion-icon name="camera"></ion-icon>\n                    <p class="label">+ Add Picture</p>\n                  </div>\n                </ion-item>\n              </ion-col>\n              <!-- HTML5 used to be (plt.is(\'mobileweb\')) || (plt.is(\'core\')) -->\n              <ion-col *ngIf="!(false)">\n                <ion-label class="section-header">Add pictures:</ion-label>\n                <input type="file" accept="image/*" (change)="imageFileInputChanged($event)">\n              </ion-col>\n            <!-- We used to use the html5 input method on all devices -->\n            <!--<ion-col>\n              <ion-label class="section-header">Add pictures:</ion-label>\n              <input type="file" accept="image/*" (change)="imageFileInputChanged($event)">\n              <ng-container *ngFor="let spin of showImageLoading">\n                <ion-spinner></ion-spinner>\n              </ng-container>\n            </ion-col>-->\n            </ion-row>\n            <ion-row>\n              <ion-col>\n                <ion-label class="section-header">Comments</ion-label>\n                <textarea type="text"\n                          [(ngModel)]="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id].mergedComments"\n                          (blur)="commentsOnBlur($event.target.value)">\n                </textarea>\n              </ion-col>\n            </ion-row>\n          <ion-row>\n            <ion-col>\n              <ion-row align-items-center class="low-padding" *ngFor="let conditionID of dataProvider.templateStructure.typeConditionsByItemID[metadata.selectedItem._id]">\n                <ion-col col-12>\n                  <ion-row>\n                    <ion-col col-md-3 col-6>\n                      <ion-label class="section-header">{{conditionID}}</ion-label>\n                      <!--show if typeConditionStructure[metadata.selectedItem._id+conditionID] has value-->\n                      <ion-segment *ngIf="(typeConditionStructure[metadata.selectedItem._id+conditionID]) && (conditionID !== \'Qualitative\') && (conditionID !== \'Subjective\')"\n                                   [(ngModel)]="typeConditionStructure[metadata.selectedItem._id+conditionID]"\n\n                                   (click)="selectConditionGroup(conditionID)">\n                        <ion-segment-button value="Yes">Show</ion-segment-button>\n                        <ion-segment-button value="No">Hide</ion-segment-button>\n                      </ion-segment>\n                      <!--show if typeConditionStructure[metadata.selectedItem._id+conditionID] is undefined-->\n                      <ion-segment *ngIf="(!typeConditionStructure[metadata.selectedItem._id+conditionID]) && (conditionID !== \'Qualitative\') && (conditionID !== \'Subjective\')"\n\n                                   (click)="selectConditionGroup(conditionID)">\n                        <ion-segment-button (ionSelect)="typeConditionStructure[metadata.selectedItem._id+conditionID] = \'Yes\'" value="Yes">Show</ion-segment-button>\n                        <ion-segment-button (ionSelect)="typeConditionStructure[metadata.selectedItem._id+conditionID] = \'No\'" value="No">Hide</ion-segment-button>\n                      </ion-segment>\n                    </ion-col>\n                  </ion-row>\n                  <div class="yes-open" *ngIf="(typeConditionStructure[metadata.selectedItem._id+conditionID] && typeConditionStructure[metadata.selectedItem._id+conditionID] === \'Yes\') || (conditionID === \'Qualitative\') || (conditionID === \'Subjective\')">\n                    <ion-row class="question-answer-block" *ngFor="let optionGroup of dataProvider.inspectionTemplate.typesConditions[conditionID].options">\n                      <ion-col class="question-block" *ngFor="let subOption of optionGroup">\n                        <ng-container *ngIf="subOptionHasData(conditionID, subOption); else elseBlock">\n                            <ion-checkbox #tpChk\n                              (ngModelChange)="checkboxTypeConditionOnSelect(tpChk.checked, conditionID, subOption[\'optionID\'])"\n                              *ngIf="subOption.hasCheckbox"\n                              [(ngModel)]="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'typesConditions\'][conditionID][subOption[\'optionID\']][\'checkboxValue\']">\n                            </ion-checkbox>\n                          <label>\n                            <ion-label [ngClass]="{\'subgroup-label\': subOption.isLabel}">{{subOption.optionName}}</ion-label>\n                            <input (blur)="updateOptionTextbox($event, conditionID, subOption[\'optionID\'])"\n                                       [(ngModel)]="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'typesConditions\'][conditionID][subOption[\'optionID\']][\'textValue\']"\n                                       *ngIf="subOption.hasText" type="text" >\n                          </label>\n                        </ng-container>\n                        <ng-template #elseBlock>\n                          <ion-checkbox #tpChk2\n\n                                        *ngIf="subOption.hasCheckbox"\n                                        (click)="checkboxTypeConditionOnSelect(tpChk2.checked, conditionID, subOption[\'optionID\'])"></ion-checkbox>\n                          <label>\n                            <ion-label [ngClass]="{\'subgroup-label\': subOption.isLabel}">{{subOption.optionName}}</ion-label>\n                            <input *ngIf="subOption.hasText" type="text" placeholder="{{subOption.optionName}}"\n                                       (blur)="updateOptionTextbox($event, conditionID, subOption[\'optionID\'])">\n                          </label>\n                        </ng-template>\n                      </ion-col>\n                    </ion-row>\n                    <ion-segment *ngIf="(conditionID !== \'Qualitative\') && (conditionID !== \'Subjective\')"\n                                 class="close-button"\n                                 [(ngModel)]="typeConditionStructure[metadata.selectedItem._id+conditionID]"\n\n                                 (ngModelChange)="selectConditionGroup(conditionID)">\n                      <ion-segment-button class="inside-tab" value="No">Close</ion-segment-button>\n                    </ion-segment>\n                  </div>\n                </ion-col>\n              </ion-row>\n\n\n                <!-- I don\'t think we\'ll use dropdowns, but here are example styles in case -->\n                <!--<ion-row>\n                <ion-col>\n                  <ion-label>Color/Finish</ion-label>\n                  <ion-select [(ngModel)]="finish">\n                    <ion-option value="gold">Gold</ion-option>\n                    <ion-option value="platinum">Platinum</ion-option>\n                  </ion-select>\n                  <ion-label>Material Grade</ion-label>\n                  <ion-select [(ngModel)]="mat-grade">\n                    <ion-option value="gold">Good</ion-option>\n                    <ion-option value="platinum">Best</ion-option>\n                  </ion-select>\n                </ion-col>\n              </ion-row>-->\n\n\n              <ion-row align-items-center>\n                <ion-col>\n                  <ion-label class="section-header">Replacement Timeline</ion-label>\n                  <ion-segment [ngModel]="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'inspectionWorkTrackingConditions\'][\'selection\']"\n                               class="replacement"\n                               (ngModelChange)="replacementTimelineOnSelect($event)">\n                    <ion-segment-button *ngFor="let timelineID of dataProvider.templateStructure[\'timelineKeys\']"\n                                        value="{{dataProvider.inspectionTemplate[\'inspectionWorkTrackingConditions\'].data[timelineID]._id}}">\n                      {{dataProvider.inspectionTemplate[\'inspectionWorkTrackingConditions\'].data[timelineID].name}}\n                      <span class="label">{{dataProvider.inspectionTemplate[\'inspectionWorkTrackingConditions\'].data[timelineID]._id}}</span>\n                    </ion-segment-button>\n                  </ion-segment>\n                </ion-col>\n              </ion-row>\n\n              <ion-row align-items-center>\n                <ion-col>\n                  <ion-label class="section-header">Hospitality Rating</ion-label>\n                  <!--shown if there is a hospitalityRating-->\n                  <ion-segment\n                    *ngIf="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'hospitalityRating\']"\n                    [ngModel]="dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'hospitalityRating\']"\n                    (ngModelChange)="hospOnSelect($event)"\n                    >\n                    <ng-container *ngFor="let number of [\'1\',\'2\',\'3\',\'4\',\'5\',\'6\',\'7\',\'8\',\'9\',\'10\']">\n                      <ion-segment-button\n                        value="{{number}}">\n                        {{number}}\n                      </ion-segment-button>\n                    </ng-container>\n                  </ion-segment>\n                  <!--show if there is no hospitalityRating-->\n                  <ion-segment\n                    *ngIf="!dataProvider.inspectionData.data[metadata.currentRoomID].data[metadata.selectedItem._id][\'hospitalityRating\']"\n                    >\n                    <ng-container *ngFor="let number of [\'1\',\'2\',\'3\',\'4\',\'5\',\'6\',\'7\',\'8\',\'9\',\'10\']">\n                      <ion-segment-button\n                        (ionSelect)="setHospValue(number)"\n                        value="{{number}}">\n                        {{number}}\n                      </ion-segment-button>\n                    </ng-container>\n                  </ion-segment>\n                  <p class="hospitality label left">Economy</p>\n                  <p class="hospitality label right">Luxury</p>\n                </ion-col>\n              </ion-row>\n              <!--<ion-row class="question-answer-block" tappable>-->\n                <!--<ion-col class="question-block">-->\n                <!--&lt;!&ndash;TODO removed till wired up&ndash;&gt;-->\n                <!--<ion-checkbox></ion-checkbox>-->\n                <!--<ion-label>Flag for special review</ion-label>-->\n                <!--</ion-col>-->\n              <!--</ion-row>-->\n              <ion-row>\n                <ion-col>\n                  <button class="full" ion-button\n                          (click)="markItemComplete(metadata.selectedItem._id)">\n                    Complete\n                  </button>\n                </ion-col>\n              </ion-row>\n            </ion-col>\n          </ion-row>\n        </div>\n        </ion-col>\n      </ion-row>\n      <ion-row *ngIf="!metadata.loadCompleted">\n        <ion-spinner></ion-spinner>\n      </ion-row>\n    </ng-container>\n  </div>\n    <!--End of room editor view-->\n  </ion-grid>\n  <span *ngIf="!((dataProvider.inspectionTemplate.roomOrder)&&(dataProvider.inspectionTemplate.data)&&(dataProvider.hospitalityStructure.chartColors))"\n    class="content-max-width header-padding">\n    <ion-spinner></ion-spinner>\n  </span>\n</ion-content>\n'/*ion-inline-end:"/Users/david/sites/__kimscott/__marsi/__ionic2/2021-new-marsi/src/pages/inspectioncreator/inspectioncreator.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* PopoverController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavParams */], __WEBPACK_IMPORTED_MODULE_7__providers_data__["a" /* Data */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_camera__["a" /* Camera */], __WEBPACK_IMPORTED_MODULE_4__ionic_native_file__["a" /* File */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* Platform */], __WEBPACK_IMPORTED_MODULE_8__providers_auth_service__["a" /* AuthService */] /*, private zone: NgZone*/, __WEBPACK_IMPORTED_MODULE_9__providers_dropbox_dropbox__["a" /* DropboxProvider */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["m" /* ToastController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* AlertController */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_image_resizer__["a" /* ImageResizer */]])
], InspectionCreatorPage);

//# sourceMappingURL=inspectioncreator.js.map

/***/ }),

/***/ 83:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PopoverinsdatePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_data__ = __webpack_require__(14);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



/*@Component({
 template: `
 <ion-list>
 <button ion-item
 *ngFor="let inspObj of inspectionObjList.data"
 (click)="selectInspection(inspObj._id);close();">{{inspObj.name}}</button>
 </ion-list>
 `
 })*/
var PopoverinsdatePage = (function () {
    function PopoverinsdatePage(navCtrl, viewCtrl, dataProvider) {
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.dataProvider = dataProvider;
        this.inspectionObjList = this.dataProvider.inspectionObjList;
    }
    PopoverinsdatePage.prototype.ngOnInit = function () {
    };
    PopoverinsdatePage.prototype.selectInspection = function (inspectionID) {
        console.log('clicked inspection to select: ' + inspectionID);
        if (this.dataProvider.inspectionData._id === inspectionID) {
            console.log('but that inspection is already selected');
        }
        else {
            console.log('different inspection, so need to load new data');
        }
    };
    PopoverinsdatePage.prototype.close = function () {
        this.viewCtrl.dismiss();
    };
    return PopoverinsdatePage;
}());
PopoverinsdatePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        template: "\n    <ion-list>\n      <button ion-item\n              *ngIf=\"inspectionObjList.data && inspectionObjList.data.length > 0\"\n              (click)=\"close();\">{{inspectionObjList.data[0].name}}\n      </button>\n    </ion-list>\n  "
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ViewController */], __WEBPACK_IMPORTED_MODULE_2__providers_data__["a" /* Data */]])
], PopoverinsdatePage);

//# sourceMappingURL=popoverinsdate.js.map

/***/ })

},[414]);
//# sourceMappingURL=main.js.map