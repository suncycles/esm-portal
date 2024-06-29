import js
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import widgets
import seaborn as sns
from zipfile import ZipFile
import io
from js import fetch
import pandas as pd
from pyweb import pydom
from pyodide.http import open_url
from pyscript import display
from js import console
from urllib.request import urlopen

# clinvar = 'https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/clinvar.csv.gz'
# iso = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/isoform_list.csv'
# llr = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/ALL_hum_isoforms_ESM1b_LLR.zip'

# df=pd.read_csv(open_url(iso),index_col=0)
# uids=list(df.index.values)
# clinvar = pd.read_csv(open_url(clinvar))
# url = urlopen(llr)

# def load_LLR(uniprot_id):
#   '''Loads the LLRs for a given uniprot id. Returns a 20xL dataframe 
#      rows are indexed by AA change, 
#      (AAorder=['K','R','H','E','D','N','Q','T','S','C','G','A','V','L','I','M','P','Y','F','W'])
#      columns indexed by WT_AA+position e.g, "G 12"
#      Usage example: load_LLR('P01116') or load_LLR('P01116-2')'''
#   with ZipFile(open_url(llr)) as myzip:
#     data = myzip.open(myzip.namelist()[0]+uniprot_id+'_LLR.csv')
#   return pd.read_csv(data,index_col=0)

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

def plot_interactive(uniprot_id, show_clinvar=False):
    # primaryLLR = load_LLR(uniprot_id)
    primaryLLR = pd.read_csv(open_url('https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv'), header=0, index_col=0)
    x_labels = primaryLLR.columns
    y_labels = primaryLLR.index

    # Initial horizontal window range
    initial_window = (0, 50)

    # Create the plot
    fig, ax = plt.subplots(figsize=(10, 5))
    plt.subplots_adjust(bottom=0.2)  # Adjust bottom to make space for the slider

    # Set title and labels
    ax.set_title(uniprot_id, fontsize=14)
    ax.set_xlabel("Sequence", fontsize=12)
    ax.set_ylabel("Substitution", fontsize=12)
    plt.xticks(rotation=-90)

    # Create the initial heatmap
    heatmap = sns.heatmap(primaryLLR.values[:, initial_window[0]:initial_window[1]], cmap="viridis_r", vmin=-20, vmax=0, 
                        xticklabels=x_labels[initial_window[0]:initial_window[1]], yticklabels=y_labels, 
                        cbar_kws={"label": "LLR"}, ax=ax)

   
    # Set the tick parameters
    ax.tick_params(axis='both', which='major', labelsize=11)

    # Create a range slider for adjusting the window size
    ax_slider = plt.axes([0.2, 0.05, 0.65, 0.03], facecolor='lightgoldenrodyellow')
    slider = widgets.RangeSlider(ax_slider, 'Window Size', 0, len(x_labels)-1, valinit=initial_window, valstep=1)

    def update(val):
        #update window size and axes
        window_min = int(slider.val[0])
        window_max = int(slider.val[1])
        ax.clear()

        # reconfig the window
        heatmap = sns.heatmap(primaryLLR.values[:, window_min:window_max], cmap="viridis_r", vmin=-20, vmax=0, 
                        xticklabels=x_labels[window_min:window_max], cbar = False, yticklabels=y_labels,ax=ax)
        #redraw
        fig.canvas.draw_idle()

    slider.on_changed(update)

    # Create a hover annotation
    annot = ax.annotate("", xy=(0,0), xytext=(20,20),
                        textcoords="offset points",
                        bbox=dict(boxstyle="round", fc="w"),
                        arrowprops=dict(arrowstyle="->"))
    annot.set_visible(False)

    def update_annot(cell):
        x, y = cell[1], cell[0]
        annot.xy = (x, y)
        text = f"{x_labels[x]} {y_labels[y]} ({primaryLLR.values[y, x]:.2f})"
        annot.set_text(text)
        annot.get_bbox_patch().set_alpha(0.4)

    def hover(event):
        vis = annot.get_visible()
        if event.inaxes == ax:
            # Get the mouse position
            x, y = event.xdata, event.ydata
            # Convert to the nearest cell indices
            if x is not None and y is not None:
                ix = int(np.round(x))
                iy = int(np.round(y))
                if ix >= 0 and ix < len(x_labels) and iy >= 0 and iy < len(y_labels):
                    update_annot((iy, ix))
                    annot.set_visible(True)
                    fig.canvas.draw_idle()
                else:
                    if vis:
                        annot.set_visible(False)
                        fig.canvas.draw_idle()

    fig.canvas.mpl_connect("motion_notify_event", hover)    
    
    # if show_clinvar:
    #     iso_clinvar = clinvar[clinvar.LLR_file_id == uniprot_id]
    #     iso_clinvar = iso_clinvar[iso_clinvar.ClinicalSignificance.isin(['Benign', 'Pathogenic'])]
    #     b_mut = set(iso_clinvar[iso_clinvar.ClinicalSignificance == 'Benign'].variant.values)
    #     p_mut = set(iso_clinvar[iso_clinvar.ClinicalSignificance == 'Pathogenic'].variant.values)
        
    #     for i in primaryLLR.columns:
    #         for j in list(primaryLLR.index):
    #             mut = i[0] + i[2:] + j
    #             if mut in b_mut:
    #                 ax.plot(i, j, 'go', markersize=8)  # green circle for benign
    #             elif mut in p_mut:
    #                 ax.plot(i, j, 'ro', markersize=8)  # red circle for pathogenic
    
    plt.show()

plot_interactive('A2RU49',show_clinvar=False)