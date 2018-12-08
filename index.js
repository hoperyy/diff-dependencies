const fse = require('fs-extra');
const path = require('path');
const fs = require('fs');
const readdirSync = require('recursive-readdir-sync');
const arrayDiff = require('simple-array-diff');
const ora = require('ora');

const _getDependencesVersion = (packageJson, packageLockJson) => {
    let dependencies = {
        type: 'update',
        map: {}
    };

    if (!fs.existsSync(packageJson) || !fs.existsSync(packageLockJson)) {
        dependencies.type = 'package-file-not-exists';
        return dependencies;
    }
    const packageJsonObj = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const packageLockJsonObj = JSON.parse(fs.readFileSync(packageLockJson, 'utf-8'));
    const depReg = /dependenc/i;

    // 找到 package.json 的各个依赖，不写版本号
    const { map } = dependencies;
    for (let key in packageJsonObj) {
        if (depReg.test(key)) {
            for (let dep in packageJsonObj[key]) {
                if (!map[dep]) {
                    map[dep] = {
                        version: packageJsonObj[key][dep]
                    };
                }
            }
        }
    }

    // 遍历 packageLockJsonObj，找到各个依赖的版本号
    for (let key in packageLockJsonObj) {
        if (depReg.test(key)) {
            for (let dep in packageLockJsonObj[key]) {
                if (map[dep]) { // 如果在 package.json 中
                    map[dep].version = packageLockJsonObj[key][dep].version;
                }
            }
        }
    }

    return dependencies;
};

const _diffDependencies = (srcDependencies, targetDependencies) => {
    const added = [];
    const removed = [];
    const common = [];

    const srcMap = srcDependencies.map;
    const targetMap = targetDependencies.map;

    if (targetDependencies.type === 'package-file-not-exists') {
        for (let key in srcMap) {
            added.push(`${key}@${srcMap[key].version}`);
        }
    } else {
        // 遍历源依赖
        for (let key in srcMap) {
            if (targetMap[key]) { // 如果旧依赖
                if (targetMap[key].version == srcMap[key].version) { // 如果二者依赖版本一致
                    common.push(`${key}@${srcMap[key].version}`);
                } else { // 如果二者版本不一致
                    added.push(`${key}@${srcMap[key].version}`);
                }
            } else { // 如果旧依赖不存在
                added.push(key);
            }
        }

        // 遍历旧依赖
        for (let key in targetMap) {
            if (!srcMap[key]) { // 如果新依赖不存在，说明需要删除
                removed.push(key);
            }
        }
    }

    return {
        added,
        removed,
        type: targetDependencies.type
    };
};

const diffDependencies = (srcFolder, targetFolder) => {
    if (!fs.existsSync(path.join(srcFolder, 'package.json')) || !fs.existsSync(path.join(srcFolder, 'package-lock.json'))) {
        throw Error('\n\npackage.json and package-lock.json file needed!\n\n'.red);
    }

    const srcDependencies = _getDependencesVersion(path.join(srcFolder, 'package.json'), path.join(srcFolder, 'package-lock.json'));
    const targetDependencies = _getDependencesVersion(path.join(targetFolder, 'package.json'), path.join(targetFolder, 'package-lock.json'));

    // 找到有变化的依赖
    return _diffDependencies(srcDependencies, targetDependencies);
};

module.exports = diffDependencies;
