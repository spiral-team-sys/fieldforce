const fs = require('fs');
const path = require('path');

const VECTOR_ICON_ROOT = path.join(
    process.cwd(),
    'node_modules',
    '@react-native-vector-icons'
);

const registry = {};

function normalizeType(packageName) {
    switch (packageName) {
        case 'fontawesome':
            return 'fontawesome';

        case 'fontawesome5':
            return 'font-awesome-5';

        case 'fontawesome6':
            return 'font-awesome-6';

        case 'material-icons':
            return 'material';

        case 'material-design-icons':
            return 'material-community';

        case 'ionicons':
            return 'ionicon';

        default:
            return packageName;
    }
}

function convertMetaJson(json) {
    const result = {};

    for (const [style, icons] of Object.entries(json)) {
        if (Array.isArray(icons)) {
            result[style] = {};

            for (const icon of icons) {
                result[style][icon] = true;
            }
        } else {
            result[style] = icons;
        }
    }

    return result;
}

if (!fs.existsSync(VECTOR_ICON_ROOT)) {
    console.error('Cannot find @react-native-vector-icons');
    process.exit(1);
}

const packages = fs
    .readdirSync(VECTOR_ICON_ROOT)
    .filter(name =>
        fs.statSync(path.join(VECTOR_ICON_ROOT, name)).isDirectory()
    );

for (const packageName of packages) {
    const glyphDir = path.join(
        VECTOR_ICON_ROOT,
        packageName,
        'glyphmaps'
    );

    if (!fs.existsSync(glyphDir))
        continue;

    const jsonFiles = fs
        .readdirSync(glyphDir)
        .filter(f => f.endsWith('.json'));

    if (!jsonFiles.length)
        continue;

    const type = normalizeType(packageName);

    // Ưu tiên *_meta.json nếu có
    const file =
        jsonFiles.find(f => f.endsWith('_meta.json')) ??
        jsonFiles[0];

    const json = JSON.parse(fs.readFileSync(path.join(glyphDir, file), 'utf8'));

    if (
        type === 'font-awesome-5' ||
        type === 'font-awesome-6'
    ) {
        registry[type] = convertMetaJson(json);
    } else {
        registry[type] = json;
    }

    console.log(`✓ ${type} -> ${file}`);
}

const output = `
// AUTO GENERATED
// DO NOT EDIT

export default ${JSON.stringify(registry, null, 2)} as const;
`;

const outFile = path.join(
    process.cwd(),
    'src/Control/Icon/IconRegistry.ts'
);

fs.mkdirSync(path.dirname(outFile), { recursive: true });

fs.writeFileSync(outFile, output);

console.log('');
console.log('=================================');
console.log(' Icon Registry Generated');
console.log(` ${outFile}`);
console.log('=================================');