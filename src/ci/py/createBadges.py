import anybadge
import os
import json

covBadgeSvg = 'cov-badge.svg'
testBadgeSvg = 'test-badge.svg'

with open('coverage.json') as jsonFile:
    covJson = json.load(jsonFile)
    print(covJson["totals"]["percent_covered"])

covPct = covJson["totals"]["percent_covered"]
if covPct < 20:
    color = 'red'
elif covPct < 70:
    color = 'orange_2'
else:
    color = 'green'

badge = anybadge.Badge('coverage', str(int(round(covPct))) + '%', default_color=color)

if os.path.exists(covBadgeSvg):
    os.remove(covBadgeSvg)
badge.write_badge(covBadgeSvg)

with open('test-report.json') as jsonFile:
    testJson = json.load(jsonFile)

testSummary = testJson["report"]["summary"]

testPassed = 0 if "passed" not in testSummary else testSummary["passed"]
testFailed = 0 if "failed" not in testSummary else testSummary["failed"]
print(str(testPassed) + " " + str(testFailed))

color = 'green' if (testPassed != 0 and testFailed == 0) else 'red'

badge = anybadge.Badge('tests', str(testPassed) + " passed, " + str(testFailed) + " failed", default_color=color)
if os.path.exists(testBadgeSvg):
    os.remove(testBadgeSvg)
badge.write_badge(testBadgeSvg)
