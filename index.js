const path = require('path');
const fs = require('fs');

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

const _diffDependencies = (oldDependencies, newDependencies) => {
    const added = [];
    const removed = [];
    const common = [];

    const srcMap = newDependencies.map;
    const targetMap = oldDependencies.map;

    if (oldDependencies.type === 'package-file-not-exists') {
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
        type: oldDependencies.type
    };
};

const diffDependencies = (oldFolder, newFolder) => {
    if (!fs.existsSync(path.join(newFolder, 'package.json')) || !fs.existsSync(path.join(newFolder, 'package-lock.json'))) {
        throw Error('\n\npackage.json and package-lock.json file needed!\n\n'.red);
    }

    const newDependencies = _getDependencesVersion(path.join(newFolder, 'package.json'), path.join(newFolder, 'package-lock.json'));
    const oldDependencies = _getDependencesVersion(path.join(oldFolder, 'package.json'), path.join(oldFolder, 'package-lock.json'));

    // 找到有变化的依赖
    return _diffDependencies(oldDependencies, newDependencies);
};

module.exports = diffDependencies;
