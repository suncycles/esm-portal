
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from zipfile import ZipFile
import io
from js import fetch
import pandas as pd
from pyweb import pydom
from pyodide.http import open_url
from pyscript import display
from js import console


clinvar = 'https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/clinvar.csv.gz'
iso = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/isoform_list.csv'
llr = './files/ALL_hum_isoforms_ESM1b_LLR.zip'

async def load_csv(url):
    response = await fetch(url)
    data = await response.text()
    return pd.read_csv(io.StringIO(data), index_col=0)

async def load_llr_csv_from_zip(zip_url, uniprot_id):
    response = await fetch(zip_url)
    data = await response.arrayBuffer()
    with ZipFile(io.BytesIO(data)) as myzip:
        with myzip.open(myzip.namelist()[0] + uniprot_id + '_LLR.csv') as file:
            return pd.read_csv(file, index_col=0)

async def main():
    LLR_FILE_URL = llr
    ISOFORM_LIST_URL = iso
    CLINVAR_URL = clinvar

    #df = await load_csv(ISOFORM_LIST_URL) #stores isoform_list.csv
    clinvar = await load_csv(CLINVAR_URL) #stores clinvar.csv.gz
    df = pd.read_csv(open_url(CLINVAR_URL))
    display(df, target="pydisplay", append="False")

    
    def meltLLR(LLR, gene_prefix=None, ignore_pos=False):
        vars = LLR.melt(ignore_index=False)
        vars['variant'] = [''.join(i.split(' ')) + j for i, j in zip(vars['variable'], vars.index)]
        vars['score'] = vars['value']
        vars = vars.set_index('variant')
        if not ignore_pos:
            vars['pos'] = [int(i[1:-1]) for i in vars.index]
        del vars['variable'], vars['value']
        if gene_prefix is not None:
            vars.index = gene_prefix + '_' + vars.index
        return vars

    async def plot_interactive(uniprot_id, show_clinvar=False):
        primaryLLR = await load_llr_csv_from_zip(LLR_FILE_URL, uniprot_id)
        
        fig, ax = plt.subplots(figsize=(14, 8))
        sns.heatmap(primaryLLR.values, ax=ax, cmap='viridis_r', cbar_kws={'label': 'LLR'}, vmin=-20, vmax=0)
        ax.set_xticks(np.arange(primaryLLR.shape[1]) + 0.5)
        ax.set_yticks(np.arange(primaryLLR.shape[0]) + 0.5)
        ax.set_xticklabels(primaryLLR.columns, rotation=90)
        ax.set_yticklabels(primaryLLR.index)
        ax.set_xlabel('Protein sequence')
        ax.set_ylabel('Amino acid change')
        ax.set_title('Protein Visualization')
        
        if show_clinvar:
            iso_clinvar = clinvar[clinvar.LLR_file_id == uniprot_id]
            iso_clinvar = iso_clinvar[iso_clinvar.ClinicalSignificance.isin(['Benign', 'Pathogenic'])]
            b_mut = set(iso_clinvar[iso_clinvar.ClinicalSignificance == 'Benign'].variant.values)
            p_mut = set(iso_clinvar[iso_clinvar.ClinicalSignificance == 'Pathogenic'].variant.values)
            
            for i in primaryLLR.columns:
                for j in list(primaryLLR.index):
                    mut = i[0] + i[2:] + j
                    if mut in b_mut:
                        ax.plot(i, j, 'go', markersize=8)  # green circle for benign
                    elif mut in p_mut:
                        ax.plot(i, j, 'ro', markersize=8)  # red circle for pathogenic
        
        plt.show()
