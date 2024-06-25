/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 *
 * Adapted from MolQL project
 */
import * as h from '../helper';
import { MolScriptBuilder } from '../../../mol-script/language/builder';
var B = MolScriptBuilder;
function proteinExpr() {
    return B.struct.filter.pick({
        0: B.struct.generator.atomGroups({
            'group-by': B.ammp('residueKey')
        }),
        test: B.core.set.isSubset([
            h.atomNameSet(['C', 'N', 'CA', 'O']),
            B.ammpSet('label_atom_id')
        ])
    });
}
function nucleicExpr() {
    return B.struct.filter.pick({
        0: B.struct.generator.atomGroups({
            'group-by': B.ammp('residueKey')
        }),
        test: B.core.logic.and([
            B.core.set.isSubset([
                h.atomNameSet(['P']),
                B.ammpSet('label_atom_id')
            ]),
            B.core.logic.or([
                B.core.set.isSubset([
                    h.atomNameSet(["O3'", "C3'", "C4'", "C5'", "O5'"]),
                    B.ammpSet('label_atom_id')
                ]),
                B.core.set.isSubset([
                    h.atomNameSet(['O3*', 'C3*', 'C4*', 'C5*', 'O5*']),
                    B.ammpSet('label_atom_id')
                ])
            ])
        ])
    });
}
function backboneExpr() {
    return B.struct.combinator.merge([
        B.struct.generator.queryInSelection({
            0: proteinExpr(),
            query: B.struct.generator.atomGroups({
                'atom-test': B.core.set.has([
                    h.atomNameSet(Backbone.protein),
                    B.ammp('label_atom_id')
                ])
            })
        }),
        B.struct.generator.queryInSelection({
            0: nucleicExpr(),
            query: B.struct.generator.atomGroups({
                'atom-test': B.core.set.has([
                    h.atomNameSet(Backbone.nucleic),
                    B.ammp('label_atom_id')
                ])
            })
        })
    ]);
}
function secStrucExpr(flags) {
    return B.struct.generator.atomGroups({
        'residue-test': B.core.flags.hasAll([
            B.ammp('secondaryStructureFlags'),
            B.struct.type.secondaryStructureFlags(flags)
        ])
    });
}
var Backbone = {
    nucleic: ['P', "O3'", "O5'", "C5'", "C4'", "C3'", 'OP1', 'OP2', 'O3*', 'O5*', 'C5*', 'C4*', 'C3*'],
    protein: ['C', 'N', 'CA', 'O']
};
var ResDict = {
    acidic: ['ASP', 'GLU'],
    aliphatic: ['ALA', 'GLY', 'ILE', 'LEU', 'VAL'],
    aromatic: ['HIS', 'PHE', 'TRP', 'TYR'],
    at: ['ADA', 'A', 'THY', 'T'],
    basic: ['ARG', 'HIS', 'LYS'],
    buried: ['ALA', 'LEU', 'VAL', 'ILE', 'PHE', 'CYS', 'MET', 'TRP'],
    cg: ['CYT', 'C', 'GUA', 'G'],
    cyclic: ['HIS', 'PHE', 'PRO', 'TRP', 'TYR'],
    hydrophobic: ['ALA', 'LEU', 'VAL', 'ILE', 'PRO', 'PHE', 'MET', 'TRP'],
    medium: ['VAL', 'THR', 'ASP', 'ASN', 'PRO', 'CYS', 'ASX', 'PCA', 'HYP'],
    neutral: ['VAL', 'PHE', 'GLN', 'TYR', 'HIS', 'CYS', 'MET', 'TRP', 'ASX', 'GLX', 'PCA', 'HYP'],
    purine: ['ADE', 'A', 'GUA', 'G'],
    pyrimidine: ['CYT', 'C', 'THY', 'T', 'URI', 'U'],
    small: ['ALA', 'GLY', 'SER'],
    water: ['H2O', 'HH0', 'OHH', 'HOH', 'OH2', 'SOL', 'WAT', 'TIP', 'TIP2', 'TIP3', 'TIP4']
};
export var keywords = {
    all: {
        '@desc': 'everything',
        map: function () { return B.struct.generator.all(); }
    },
    none: {
        '@desc': 'nothing',
        map: function () { return B.struct.generator.empty(); }
    },
    protein: {
        '@desc': 'a residue with atoms named C, N, CA, and O',
        map: function () { return proteinExpr(); }
    },
    nucleic: {
        '@desc': "a residue with atoms named P, O1P, O2P and either O3', C3', C4', C5', O5' or O3*, C3*, C4*, C5*, O5*. This definition assumes that the base is phosphorylated, an assumption which will be corrected in the future.",
        map: function () { return nucleicExpr(); }
    },
    backbone: {
        '@desc': 'the C, N, CA, and O atoms of a protein and the equivalent atoms in a nucleic acid.',
        map: function () { return backboneExpr(); }
    },
    sidechain: {
        '@desc': 'non-backbone atoms and bonds',
        map: function () { return h.invertExpr(backboneExpr()); }
    },
    water: {
        '@desc': 'all atoms with the resname H2O, HH0, OHH, HOH, OH2, SOL, WAT, TIP, TIP2, TIP3 or TIP4',
        abbr: ['waters'],
        map: function () { return h.resnameExpr(ResDict.water); }
    },
    at: {
        '@desc': 'residues named ADA A THY T',
        map: function () { return h.resnameExpr(ResDict.at); }
    },
    acidic: {
        '@desc': 'residues named ASP GLU',
        map: function () { return h.resnameExpr(ResDict.acidic); }
    },
    acyclic: {
        '@desc': '"protein and not cyclic"',
        map: function () { return B.struct.modifier.intersectBy({
            0: proteinExpr(),
            by: h.invertExpr(h.resnameExpr(ResDict.cyclic))
        }); }
    },
    aliphatic: {
        '@desc': 'residues named ALA GLY ILE LEU VAL',
        map: function () { return h.resnameExpr(ResDict.aliphatic); }
    },
    alpha: {
        '@desc': "atom's residue is an alpha helix",
        map: function () { return secStrucExpr(['alpha']); }
    },
    amino: {
        '@desc': 'a residue with atoms named C, N, CA, and O',
        map: function () { return proteinExpr(); }
    },
    aromatic: {
        '@desc': 'residues named HIS PHE TRP TYR',
        map: function () { return h.resnameExpr(ResDict.aromatic); }
    },
    basic: {
        '@desc': 'residues named ARG HIS LYS',
        map: function () { return h.resnameExpr(ResDict.basic); }
    },
    bonded: {
        '@desc': 'atoms for which numbonds > 0',
        map: function () { return h.asAtoms(B.struct.filter.pick({
            '0': B.struct.modifier.includeConnected({
                '0': B.struct.generator.all(),
                'bond-test': B.core.flags.hasAny([
                    B.struct.bondProperty.flags(),
                    B.struct.type.bondFlags(['covalent', 'metallic', 'sulfide'])
                ])
            }),
            test: B.core.rel.gr([
                B.struct.atomSet.atomCount(), 1
            ])
        })); }
    },
    buried: {
        '@desc': 'residues named ALA LEU VAL ILE PHE CYS MET TRP',
        map: function () { return h.resnameExpr(ResDict.buried); }
    },
    cg: {
        '@desc': 'residues named CYT C GUA G',
        map: function () { return h.resnameExpr(ResDict.cg); }
    },
    charged: {
        '@desc': '"basic or acidic"',
        map: function () { return h.resnameExpr(ResDict.basic.concat(ResDict.acidic)); }
    },
    cyclic: {
        '@desc': 'residues named HIS PHE PRO TRP TYR',
        map: function () { return h.resnameExpr(ResDict.cyclic); }
    },
    hetero: {
        '@desc': '"not (protein or nucleic)"',
        map: function () { return h.invertExpr(B.struct.combinator.merge([proteinExpr(), nucleicExpr()])); }
    },
    hydrogen: {
        '@desc': 'name "[0-9]?H.*"',
        map: function () { return B.struct.generator.atomGroups({
            'atom-test': B.core.str.match([
                B.core.type.regex(['^[0-9]?[H].*$', 'i']),
                B.core.type.str([B.ammp('label_atom_id')])
            ])
        }); }
    },
    large: {
        '@desc': '"protein and not (small or medium)"',
        map: function () { return B.struct.modifier.intersectBy({
            0: proteinExpr(),
            by: h.invertExpr(h.resnameExpr(ResDict.small.concat(ResDict.medium)))
        }); }
    },
    medium: {
        '@desc': 'residues named VAL THR ASP ASN PRO CYS ASX PCA HYP',
        map: function () { return h.resnameExpr(ResDict.medium); }
    },
    neutral: {
        '@desc': 'residues named VAL PHE GLN TYR HIS CYS MET TRP ASX GLX PCA HYP',
        map: function () { return h.resnameExpr(ResDict.neutral); }
    },
    hydrophobic: {
        '@desc': 'hydrophobic resname ALA LEU VAL ILE PRO PHE MET TRP',
        map: function () { return h.resnameExpr(ResDict.hydrophobic); }
    },
    polar: {
        '@desc': '"protein and not hydrophobic"',
        map: function () { return B.struct.modifier.intersectBy({
            0: proteinExpr(),
            by: h.invertExpr(h.resnameExpr(ResDict.hydrophobic))
        }); }
    },
    purine: {
        '@desc': 'residues named ADE A GUA G',
        map: function () { return h.resnameExpr(ResDict.purine); }
    },
    pyrimidine: {
        '@desc': 'residues named CYT C THY T URI U',
        map: function () { return h.resnameExpr(ResDict.pyrimidine); }
    },
    small: {
        '@desc': 'residues named ALA GLY SER',
        map: function () { return h.resnameExpr(ResDict.small); }
    },
    surface: {
        '@desc': '"protein and not buried"',
        map: function () { return B.struct.modifier.intersectBy({
            0: proteinExpr(),
            by: h.invertExpr(h.resnameExpr(ResDict.buried))
        }); }
    },
    alpha_helix: {
        '@desc': "atom's residue is in an alpha helix",
        map: function () { return secStrucExpr(['alpha']); }
    },
    pi_helix: {
        '@desc': "atom's residue is in a pi helix",
        map: function () { return secStrucExpr(['pi']); }
    },
    helix_3_10: {
        '@desc': "atom's residue is in a 3-10 helix",
        map: function () { return secStrucExpr(['3-10']); }
    },
    helix: {
        '@desc': "atom's residue is in an alpha or pi or 3-10 helix",
        map: function () { return secStrucExpr(['helix']); }
    },
    extended_beta: {
        '@desc': "atom's residue is a beta sheet",
        map: function () { return secStrucExpr(['sheet']); }
    },
    bridge_beta: {
        '@desc': "atom's residue is a beta sheet",
        map: function () { return secStrucExpr(['strand']); }
    },
    sheet: {
        '@desc': "atom's residue is a beta sheet",
        map: function () { return secStrucExpr(['beta']); }
    },
    turn: {
        '@desc': "atom's residue is in a turn conformation",
        map: function () { return secStrucExpr(['turn']); }
    },
    coil: {
        '@desc': "atom's residue is in a coil conformation",
        map: function () { return B.struct.modifier.intersectBy({
            0: proteinExpr(),
            by: secStrucExpr(['none'])
        }); }
    }
};
